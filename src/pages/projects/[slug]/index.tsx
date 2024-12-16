import { useState, useContext, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { format } from "date-fns";
import { debounce } from "lodash";
import { fetchProjectInfo } from "../../../api/useProjectInfo";
import { fetchProjectTask } from "../../../api/useProjectTask";
import { fetchTaskType } from "../../../api/useTaskType";
import { fetchTaskUsers } from "../../../api/taskUsers";
import { ProjectInfo } from "../../../types/ProjectInfo";
import { TaskResponse } from "../../../types/Task";
import ProjectsLayout from "../layout";
import style from "./project.module.scss";
import { Breadcrumbs, Anchor, Switch, Button, Input, CloseButton, MultiSelect, MultiSelectProps, Text, Checkbox, Modal } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import Image from "next/image";
import { UserContext } from "@/context/UserContext";
import KanbanBoard from "../../../components/Project/KanbanBoard";
import { useDisclosure } from "@mantine/hooks";
import { CreateTaskForm } from "@/components/CreateTaskForm/CreateTaskForm";
import { queryClient } from "@/api/quiryClient";

export default function Project() {
  const { query } = useRouter();
  const slug = Array.isArray(query.slug) ? query.slug[0] : query.slug;

  const { user } = useContext(UserContext);

  const [filterName, setFilterName] = useState<string>("");
  const [debounceFilterName, setDebounceFilterName] = useState<string>("");
  const [filterUserIds, setFilterUserIds] = useState<number[]>([]);
  const [filterTypeIds, setFilterTypeIds] = useState<number[]>([]);
  const [filterComponentIds, setFilterComponentIds] = useState<number[]>([]);
  const [filterStartDate, setFilterStartDate] = useState<[Date | null, Date | null]>([null, null]);
  const [filterEndDate, setFilterEndDate] = useState<[Date | null, Date | null]>([null, null]);
  const [onlyMyTasks, setOnlyMyTasks] = useState<boolean>(false);
  const [opened, { open, close }] = useDisclosure(false);
  const [confirmationOpened, setConfirmationOpened] = useState(false);
  const [selectedNames, setSelectedNames] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedComponents, setSelectedComponents] = useState<string[]>([]);

  const currentUser = user?.data;

  const handleOnlyMyTasksChange = (checked: boolean) => {
    setOnlyMyTasks(checked);

    if (checked && currentUser) {
      setFilterUserIds((prev) => (prev.includes(currentUser.id) ? prev : [...prev, currentUser.id]));
    } else if (!checked && currentUser) {
      setFilterUserIds((prev) => prev.filter((id) => id !== currentUser.id));
    }
  };

  const handleFilterNameChange = debounce((filterName: string) => setDebounceFilterName(filterName), 600);

  useEffect(() => {
    if (filterName.length >= 3) {
      handleFilterNameChange(filterName);
    }
  }, [filterName, handleFilterNameChange]);

  const { data: projectInfo } = useQuery<ProjectInfo>({
    queryKey: ["projectInfo", slug],
    queryFn: () => fetchProjectInfo({ slug }),
    enabled: !!slug,
  });

  const { data: users } = useQuery({
    queryKey: ["taskUsers"],
    queryFn: () => fetchTaskUsers({ slug: slug }),
    enabled: !!slug,
  });

  const { data: types } = useQuery({
    queryKey: ["taskType"],
    queryFn: fetchTaskType,
  });

  const { data: projectTask } = useQuery<TaskResponse>(
    {
      queryKey: ["projectTask", slug, debounceFilterName, filterUserIds, filterTypeIds, filterComponentIds, filterStartDate, filterEndDate],
      queryFn: async () => {
        const result = await fetchProjectTask({
          slug,
          filters: {
            name: debounceFilterName,
            user_id: filterUserIds,
            type_id: filterTypeIds,
            component: filterComponentIds,
            date_start_from: filterStartDate[0] ? format(filterStartDate[0], "dd.MM.yyyy") : null,
            date_start_to: filterStartDate[1] ? format(filterStartDate[1], "dd.MM.yyyy") : null,
            date_end_from: filterEndDate[0] ? format(filterEndDate[0], "dd.MM.yyyy") : null,
            date_end_to: filterEndDate[1] ? format(filterEndDate[1], "dd.MM.yyyy") : null,
          },
        });
        return result;
      },
      enabled: !!slug,
    },
    queryClient
  );

  const handleSelectOption = (selectedItems: string[], setSelectedItems: (items: string[]) => void) => (optionValue: string) => {
    setSelectedItems(selectedItems.includes(optionValue) ? selectedItems.filter((value) => value !== optionValue) : [...selectedItems, optionValue]);
  };

  const renderMultiSelectOption = (selectedItems: string[], handleOption: (optionValue: string) => void): MultiSelectProps["renderOption"] => {
    const OptionComponent = ({ option }: { option: { value: string; label: string } }) => (
      <div className={style.multiSelectOption} onClick={() => handleOption(option.value)}>
        <Checkbox size="xs" checked={selectedItems.includes(option.value)} onChange={() => handleOption(option.value)} />
        <Text size="sm" style={{ marginLeft: "8px", cursor: "pointer" }}>
          {option.label}
        </Text>
      </div>
    );
    return OptionComponent;
  };

  const usersData = users?.data.map((user) => ({
    value: user.id.toString(),
    label: `${user.name} ${user.surname}`,
  }));

  const typesData = types?.data.map((type) => ({
    value: type.id.toString(),
    label: type.name,
  }));

  const componentsData = projectInfo?.flow.possibleProjectComponents.map((component) => ({
    value: component.id.toString(),
    label: component.name,
  }));

  const handleNameOption = handleSelectOption(selectedNames, setSelectedNames);
  const handleTypeOption = handleSelectOption(selectedTypes, setSelectedTypes);
  const handleComponentOption = handleSelectOption(selectedComponents, setSelectedComponents);

  const renderNameOption = renderMultiSelectOption(selectedNames, handleNameOption);
  const renderTypeOption = renderMultiSelectOption(selectedTypes, handleTypeOption);
  const renderComponentOption = renderMultiSelectOption(selectedComponents, handleComponentOption);

  return (
    <div className={style.project}>
      <div className={style.project__container}>
        <Modal
          title="Создание задачи"
          size={936}
          yOffset="0"
          opened={opened}
          onClose={close}
          onClick={() => {
            open();
            setConfirmationOpened(true);
          }}
          centered
          styles={{
            title: { fontSize: "22px", fontWeight: "600" },
            content: {
              padding: "16px 24px",
              height: "100%",
              borderRadius: "16px",
            },
            header: { padding: 0 },
            body: { padding: 0 },
          }}
        >
          <CreateTaskForm setConfirmationOpened={setConfirmationOpened} />
        </Modal>

        <Modal
          opened={confirmationOpened}
          onClose={() => setConfirmationOpened(false)} // Закрытие модалки подтверждения
          title="Закрыть окно?"
          centered
          classNames={{
            content: style.root,
            title: style.title,
            header: style.header,
          }}
        >
          <div>
            <button
              className={style.add}
              onClick={() => {
                setConfirmationOpened(false);
                close();
              }}
            >
              Да
            </button>
            <button className={style.cancel} onClick={() => setConfirmationOpened(false)}>
              Нет
            </button>
          </div>
        </Modal>
        <Breadcrumbs
          classNames={{
            separator: style.customSeparator,
            root: style.customBreadcrumbs,
          }}
          separator={<span>/</span>}
        >
          <Anchor href="/" c="dimmed">
            Главная
          </Anchor>
          <Anchor href="/projects" c="dimmed">
            Проекты
          </Anchor>
          <Anchor href="">{projectInfo?.name}</Anchor>
        </Breadcrumbs>
        <div className={style.project__content}>
          <div className={style.project__content_header}>
            <div className={style.project__content_header_left}>
              <p className={style.project__content_header_title}>{projectInfo?.name}</p>
              <Switch
                checked={onlyMyTasks}
                onChange={(event) => handleOnlyMyTasksChange(event.currentTarget.checked)}
                label="Только мои"
                size="xs"
                className={style.project__content_header_switch}
              />
            </div>
            {user?.data.is_admin && (
              <Button
                onClick={open}
                leftSection={<Image src="/img/project/add.svg" alt="add" width={16} height={16} />}
                className={style.project__content_header_add}
              >
                Добавить задачу
              </Button>
            )}
          </div>
          <div className={style.project__content_filters}>
            <div>
              <p>Название задачи</p>
              <Input
                value={filterName}
                onChange={(e) => {
                  const value = e.target.value;
                  setFilterName(value);
                  if (value === "" || value.length < 3) {
                    setDebounceFilterName("");
                  } else {
                    handleFilterNameChange(value);
                  }
                }}
                rightSectionPointerEvents="all"
                variant="filled"
                size="sm"
                radius="md"
                placeholder="Введите название задачи"
                rightSection={
                  <CloseButton
                    aria-label="Clear input"
                    onClick={() => {
                      setFilterName("");
                      setDebounceFilterName("");
                    }}
                    style={{ display: filterName ? undefined : "none" }}
                  />
                }
                styles={{
                  input: {
                    width: "264px",
                    height: "40px",
                    paddingLeft: "20px",
                    marginTop: "4px",
                    letterSpacing: "0.5px",
                  },
                }}
              />
            </div>
            <div>
              <p>Выбрать пользователей</p>
              <MultiSelect
                variant="filled"
                placeholder="Пользователи"
                searchable
                clearable
                value={filterUserIds.map(String)}
                data={usersData}
                onChange={(values) => setFilterUserIds(values.map(Number))}
                renderOption={renderNameOption}
                nothingFoundMessage="Ничего не найдено"
                rightSectionPointerEvents="none"
                rightSection={<Image src="/img/project/select.svg" alt="logo" width={16} height={16} />}
                classNames={{
                  input: `${style.input}`,
                  pillsList: `${style.pillsList}`,
                  pill: `${style.pill}`,
                  inputField: `${style.inputField}`,
                }}
              />
            </div>
            <div>
              <p>Выбрать тип</p>
              <MultiSelect
                variant="filled"
                placeholder="Выбрать тип"
                searchable
                clearable
                value={filterTypeIds.map(String)}
                data={typesData}
                onChange={(values) => setFilterTypeIds(values.map(Number))}
                renderOption={renderTypeOption}
                nothingFoundMessage="Ничего не найдено"
                rightSectionPointerEvents="none"
                rightSection={<Image src="/img/project/select.svg" alt="logo" width={16} height={16} />}
                classNames={{
                  input: `${style.input}`,
                  pillsList: `${style.pillsList}`,
                  pill: `${style.pill}`,
                  inputField: `${style.inputField}`,
                }}
              />
            </div>
            <div>
              <p>Выбрать компонент</p>
              <MultiSelect
                variant="filled"
                placeholder="Выбрать компонент"
                searchable
                clearable
                value={filterComponentIds.map(String)}
                data={componentsData}
                onChange={(values) => setFilterComponentIds(values.map(Number))}
                renderOption={renderComponentOption}
                nothingFoundMessage="Ничего не найдено"
                rightSectionPointerEvents="none"
                rightSection={<Image src="/img/project/select.svg" alt="logo" width={16} height={16} />}
                classNames={{
                  input: `${style.input}`,
                  pillsList: `${style.pillsList}`,
                  pill: `${style.pill}`,
                  inputField: `${style.inputField}`,
                }}
              />
            </div>
            <div>
              <DatePickerInput
                variant="filled"
                rightSection={<Image src="/img/project/date.svg" alt="logo" width={16} height={16} />}
                rightSectionPointerEvents="none"
                placeholder="Дата начала"
                valueFormat="DD.MM.YYYY"
                type="range"
                value={filterStartDate}
                onChange={setFilterStartDate}
                style={{
                  width: "264px",
                  height: "40px",
                  marginTop: "4px",
                  letterSpacing: "0.5px",
                  borderRadius: "8px",
                }}
              />
            </div>
            <div>
              <DatePickerInput
                variant="filled"
                rightSection={<Image src="/img/project/date.svg" alt="logo" width={16} height={16} />}
                rightSectionPointerEvents="none"
                placeholder="Дата завершения"
                valueFormat="DD.MM.YYYY"
                type="range"
                value={filterEndDate}
                onChange={setFilterEndDate}
                style={{
                  width: "264px",
                  height: "40px",
                  marginTop: "4px",
                  letterSpacing: "0.5px",
                  borderRadius: "8px",
                }}
              />
            </div>
          </div>
          <div className={style.project__content_tasks}>
            <KanbanBoard projectTask={projectTask} />
          </div>
        </div>
      </div>
    </div>
  );
}

Project.getLayout = (page: React.ReactNode) => <ProjectsLayout>{page}</ProjectsLayout>;
