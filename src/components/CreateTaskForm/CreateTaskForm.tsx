import {
  Components,
  getComponents,
  getPriorities,
  getTaskTypes,
  Priorities,
  TaskTypes,
} from "@/api/Guids";
import { queryClient } from "@/api/quiryClient";
import { ProjectInfo } from "@/types/ProjectInfo";
import { Input, MultiSelect, Select } from "@mantine/core";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import { Controller, useForm } from "react-hook-form";
import { SelectCustomArrow } from "../SelectCustomArrow/SelectCustomArrow";
import { DatePickerInput, DateValue } from "@mantine/dates";
import { RichTextEditor, Link } from "@mantine/tiptap";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import "@mantine/tiptap/styles.css";
import { Dropzone, FileWithPath } from "@mantine/dropzone";
import styles from "./createTaskForm.module.scss";
import { AttachFileToTask, DownloadFiles } from "@/api/Files";
import { DatePickerCustomIcon } from "../DatePickerCustomIcon/DatePickerCustomIcon";
import { fetchProjectInfo } from "@/api/useProjectInfo";
import { CreateTask, EditTask } from "@/api/taskInfo";
import { TaskDetailResponse } from "@/types/Task";

export interface FormTypes {
  name: string;
  task_type_id: number;
  component_id: number;
  executors: number[];
  priority_id: number;
  estimate_cost?: number | null;
  begin?: string | null; // ISO строка даты
  end?: string | null; // ISO строка даты
  description?: string | null;
  layout_link?: string | null;
  markup_link?: string | null;
  dev_link?: string | null;
}

export interface createTaskData extends FormTypes {
  stage_id: number;
  block_id?: number | null; // null? []?
  release_id?: number | null; // null?
  related_id?: number | null; // null? []?
  epic_id?: number | null; // null?
  estimate_worker?: number | null;
}

interface CreateTaskForm {
  setConfirmationOpened: Dispatch<SetStateAction<boolean>>;
  taskDetail?: TaskDetailResponse; // протипизировать если успеем
}

type Entries<T> = [keyof T, T[keyof T]][];

const linkRules = {
  value:
    /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[\-;:&=\+\$,\w]+@)?[A-Za-z0-9\.\-]+|(?:www\.|[\-;:&=\+\$,\w]+@)[A-Za-z0-9\.\-]+)((?:\/[\+~%\/\.\w\-_]*)?\??(?:[\-\+=&;%@\.\w_]*)#?(?:[\.\!\/\\\w]*))?)/,
  message: "Укажите ссылку",
};

const reuiredRules = {
  required: "Надо заполнить",
};

const textEditorIconStyles = {
  control: { border: "none", borderRadius: "0", backgroundColor: "#f4f6f8" },
};

export const CreateTaskForm = ({
  setConfirmationOpened,
  taskDetail,
}: CreateTaskForm) => {
  const { query } = useRouter();
  const slug = Array.isArray(query.slug) ? query.slug[0] : query.slug;
  const [taskTypeText, setTaskTypeText] = useState<string | null>(null);
  const [componentText, setComponentText] = useState<string | null>(null);
  const [executorsText, setExecutorsText] = useState<string[]>([]);
  const [priorityText, setPriorityText] = useState<string | null>(null);
  const [estimateCostText, setEstimateCostText] = useState<string | null>(null);
  const [beginText, setBeginText] = useState<DateValue>(null);
  const [endText, setEndText] = useState<DateValue>(null);
  const [files, setFiles] = useState<FileWithPath[]>([]);
  const [addedTaskId, setAddedTaskId] = useState<number | null>(null);

  useEffect(() => {}, [files]);
  useEffect(() => {
    if (taskDetail) {
      setValue("name", taskDetail?.data.name);

      setValue("task_type_id", taskDetail?.data.task_type.id);
      setTaskTypeText(taskDetail?.data.task_type.name);

      setValue("component_id", taskDetail?.data.component.id);
      setComponentText(taskDetail?.data.component.name);

      const executorsId = taskDetail?.data.users.map((item) => item.id);
      const executorsName = taskDetail?.data.users.map((item) => {
        return `${item.surname} ${item.name} ${item.patronymic}`;
      });
      setValue("executors", executorsId);
      setExecutorsText(executorsName);

      setValue("priority_id", taskDetail?.data.priority.id);
      setPriorityText(taskDetail?.data.priority.name);

      setValue("estimate_cost", taskDetail?.data.estimate_cost);
      setEstimateCostText(taskDetail?.data.estimate_cost?.toString());

      if (taskDetail?.data.begin) {
        const beginDate = new Date(taskDetail?.data.begin);
        setValue("begin", taskDetail?.data.begin);
        setBeginText(beginDate);
      }

      if (taskDetail?.data.end) {
        const endDate = new Date(taskDetail?.data.end);
        setValue("end", taskDetail?.data.end);
        setEndText(endDate);
      }

      setValue("description", taskDetail?.data.description);

      setValue("layout_link", taskDetail?.data.layout_link);

      setValue("dev_link", taskDetail?.data.dev_link);

      setValue("markup_link", taskDetail?.data.markup_link);
    }
  }, []);

  const getProjectData = useQuery<ProjectInfo>(
    {
      queryKey: ["projectInfo", slug],
      queryFn: () => fetchProjectInfo({ slug }),
    },
    queryClient
  );

  const getTaskTypesData = useQuery<TaskTypes>(
    {
      queryFn: () => getTaskTypes(),
      queryKey: ["task_types"],
      retry: false,
    },
    queryClient
  );

  const getComponentsData = useQuery<Components>(
    {
      queryFn: () => getComponents(),
      queryKey: ["components"],
      retry: false,
    },
    queryClient
  );

  const getPrioritiesData = useQuery<Priorities>(
    {
      queryFn: () => getPriorities(),
      queryKey: ["priorities"],
      retry: false,
    },
    queryClient
  );

  const createTaskMutation = useMutation(
    {
      mutationFn: CreateTask,

      async onSuccess(data) {
        const response = await data.json();
        setAddedTaskId(response.data.id);

        if (files.length > 0) {
          downLoadFilesMutation.mutate(files);
        } else {
          queryClient.invalidateQueries({ queryKey: ["projectTask", slug] });
        }
      },
    },
    queryClient
  );

  const editTaskMutation = useMutation(
    {
      mutationFn: EditTask,

      async onSuccess(data) {
        const response = await data.json();
        const taskId = response.id;
        queryClient.invalidateQueries({ queryKey: ["taskDetail", taskId] });
        queryClient.invalidateQueries({ queryKey: ["projectTask", slug] });
      },
    },
    queryClient
  );

  const downLoadFilesMutation = useMutation(
    {
      mutationFn: DownloadFiles,

      async onSuccess(data) {
        const response = await data.json();
        for (let i = 0; i < response.data.length; i++) {
          attachFileToTaskMutation.mutate({
            taskId: addedTaskId || 0,
            fileId: response.data[i].id,
          });
        }
        queryClient.invalidateQueries({ queryKey: ["projectTask", slug] });
      },
    },
    queryClient
  );

  const attachFileToTaskMutation = useMutation(
    {
      mutationFn: AttachFileToTask,
      onSuccess() {
        setFiles([]);
      },
    },

    queryClient
  );

  const retry = () => {
    getTaskTypesData.refetch();
    getComponentsData.refetch();
    getProjectData.refetch();
    getPrioritiesData.refetch();
  };

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
    clearErrors,
  } = useForm<FormTypes>();

  const resetValues = () => {
    reset();
    clearErrors();
    setTaskTypeText(null);
    setComponentText(null);
    setExecutorsText([]);
    setPriorityText(null);
    setEstimateCostText(null);
    setValue("estimate_cost", null);
    setValue("begin", null);
    setBeginText(null);
    setValue("end", null);
    setEndText(null);
    setValue("description", null);
    editor?.commands.clearContent();
    setValue("layout_link", null);
    setValue("dev_link", null);
    setValue("markup_link", null);
  };

  const onSubmit = (formData: FormTypes) => {
    const formattedFormData: createTaskData = { ...formData, stage_id: 1 };

    (Object.entries(formattedFormData) as Entries<createTaskData>).forEach(
      ([key, value]) => {
        if (value) {
          (
            formattedFormData as Record<
              keyof createTaskData,
              createTaskData[keyof createTaskData]
            >
          )[key] = value;
        } else {
          (
            formattedFormData as Record<
              keyof createTaskData,
              createTaskData[keyof createTaskData]
            >
          )[key] = null;
        }
      }
    );

    if (taskDetail) {
      const data: {
        data: createTaskData;
        id: number;
      } = { data: formattedFormData, id: taskDetail?.data.id };
      editTaskMutation.mutate(data);
      resetValues();
    } else {
      if (slug) {
        const data: {
          taskData: createTaskData;
          slug: string;
        } = { taskData: formattedFormData, slug: slug };

        createTaskMutation.mutate(data);
        resetValues();
      }
    }
  };

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: taskDetail?.data.description || null,
    onUpdate: ({ editor }) => {
      const editorText = editor?.getText();
      setValue("description", editorText);
    },
    immediatelyRender: false,
  });

  if (
    getTaskTypesData.status === "pending" ||
    getComponentsData.status === "pending" ||
    getProjectData.status === "pending" ||
    getPrioritiesData.status === "pending"
  ) {
    return <div>Loading...</div>;
  }

  if (
    getTaskTypesData.status === "error" ||
    getComponentsData.status === "error" ||
    getProjectData.status === "error" ||
    getPrioritiesData.status === "error"
  ) {
    return (
      <div>
        <p>Ошибка сервера</p>
        <button onClick={retry}>retry</button>
      </div>
    );
  }

  const taskTypesOptions = () => {
    return getTaskTypesData.data.data.map((item) => item.name);
  };

  const componentsOptions = () => {
    return getComponentsData.data.data.map((item) => item.name);
  };

  const executorsOptions = () => {
    return getProjectData.data.users.map(
      (item) => `${item.surname} ${item.name} ${item.patronymic}`
    );
  };

  const prioritiesOptions = () => {
    return getPrioritiesData.data.data.map((item) => item.name);
  };

  const handleTaskTypeChange = (value: string | null) => {
    if (!value) return;

    const type = getTaskTypesData.data.data.filter(
      (item) => item.name === value
    );

    if (type.length > 0) {
      setValue("task_type_id", type[0].id);
      setTaskTypeText(value);
      clearErrors("task_type_id");
    }
  };

  const handleСomponentsChange = (value: string | null) => {
    if (!value) return;
    const component = getComponentsData.data.data.filter(
      (item) => item.name === value
    );
    if (component.length > 0) {
      setValue("component_id", component[0].id);
      setComponentText(value);
      clearErrors("component_id");
    }
  };

  const handleExecutorChange = (value: string[]) => {
    if (!value) return;

    if (value.length === 0) {
      setExecutorsText([]);
      setValue("executors", []);
    }

    const allExecutors = getProjectData.data.users.map((item) => {
      return {
        id: item.id,
        name: `${item.surname} ${item.name} ${item.patronymic}`,
      };
    });

    const chosenExecutors = allExecutors.reduce<number[]>((acc, item) => {
      if (value.includes(item.name)) {
        return [...acc, item.id];
      }
      return acc;
    }, []);

    if (chosenExecutors.length > 0) {
      setValue("executors", chosenExecutors);
      setExecutorsText(value);
      clearErrors("executors");
    }
  };

  const handlePriorityChange = (value: string | null) => {
    if (!value) return;
    const priority = getPrioritiesData.data.data.filter(
      (item) => item.name === value
    );
    if (priority.length > 0) {
      setValue("priority_id", priority[0].id);
      setPriorityText(value);
      clearErrors("priority_id");
    }
  };

  const handleEstimateCostChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    if (isNaN(Number(value))) {
      return;
    }

    setEstimateCostText(value);
    setValue("estimate_cost", Number(value));
  };

  const handleBeginChange = (value: DateValue) => {
    setBeginText(value);
    setValue("begin", value?.toISOString());
  };

  const handleEndChange = (value: DateValue) => {
    setEndText(value);
    setValue("end", value?.toISOString());
  };

  const handleDropZoneChange = (value: FileWithPath[]) => {
    setFiles((prev) => {
      return [...prev, ...value];
    });
  };

  const previews = files.map((file, index) => {
    return (
      <div key={index} className={styles.file}>
        <p className={styles.descr}>{file.name}</p>
        <button
          className={styles.button}
          onClick={() => handleDeleteFile(index)}
          type="button"
        >
          <span className={styles.line}></span>
          <span className={styles.line}></span>
        </button>
      </div>
    );
  });

  const previewsTaskDetail = taskDetail?.data.files.map((file, index) => {
    return (
      <div key={index} className={styles.file}>
        <p className={styles.descr}>{file.original_name}</p>
        <button
          className={styles.button}
          onClick={() => handleDeleteFile(index)}
          type="button"
        >
          <span className={styles.line}></span>
          <span className={styles.line}></span>
        </button>
      </div>
    );
  });

  const handleDeleteFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <form
      className={styles.form}
      onClick={(e) => e.stopPropagation()}
      onSubmit={handleSubmit(onSubmit)}
    >
      <Input.Wrapper
        classNames={{
          root: styles.root,
          error: styles.error,
          label: styles.label,
        }}
        label="Название"
        withAsterisk
        error={errors.name?.message}
      >
        <Controller
          name="name"
          control={control}
          rules={reuiredRules}
          render={({ field }) => (
            <Input
              {...field}
              variant="filled"
              placeholder="Название задачи"
              value={field.value || ""}
              classNames={{ input: styles.field }}
            />
          )}
        />
      </Input.Wrapper>
      <div className={styles.upper}>
        <Input.Wrapper
          classNames={{
            root: styles.input,
            error: styles.error,
            label: styles.label,
          }}
          label="Тип задачи"
          withAsterisk
          error={errors.task_type_id?.message}
        >
          <Controller
            name="task_type_id"
            control={control}
            rules={reuiredRules}
            render={() => (
              <Select
                data={taskTypesOptions()}
                placeholder="Выберите тип задачи"
                onChange={handleTaskTypeChange}
                value={taskTypeText}
                rightSection={<SelectCustomArrow />}
                classNames={{ input: styles.field }}
              />
            )}
          />
        </Input.Wrapper>
        <Input.Wrapper
          classNames={{
            root: styles.input,
            error: styles.error,
            label: styles.label,
          }}
          label="Компонент"
          withAsterisk
          error={errors.component_id?.message}
        >
          <Controller
            name="component_id"
            control={control}
            rules={reuiredRules}
            render={() => (
              <Select
                data={componentsOptions()}
                placeholder="Не выбран"
                onChange={handleСomponentsChange}
                value={componentText}
                rightSection={<SelectCustomArrow />}
                classNames={{ input: styles.field }}
              />
            )}
          />
        </Input.Wrapper>
        <Input.Wrapper
          classNames={{
            root: styles.input,
            error: styles.error,
            label: styles.label,
          }}
          label="Исполнитель"
          withAsterisk
          error={errors.executors?.message}
        >
          <Controller
            name="executors"
            control={control}
            rules={reuiredRules}
            render={() => (
              <MultiSelect
                data={executorsOptions()}
                placeholder={executorsText.length === 0 ? "Исполнитель" : ""}
                onChange={handleExecutorChange}
                value={executorsText}
                rightSection={<SelectCustomArrow />}
                classNames={{ input: styles.field }}
              />
            )}
          />
        </Input.Wrapper>
      </div>
      <div className={styles.middle}>
        <Input.Wrapper
          style={{ marginBottom: "16px" }}
          classNames={{
            root: styles.input,
            error: styles.error,
            label: styles.label,
          }}
          label="Приоритеты"
          withAsterisk
          error={errors.priority_id?.message}
        >
          <Controller
            name="priority_id"
            control={control}
            rules={reuiredRules}
            render={() => (
              <Select
                data={prioritiesOptions()}
                placeholder="Не выбран"
                onChange={handlePriorityChange}
                value={priorityText}
                rightSection={<SelectCustomArrow />}
                classNames={{ input: styles.field }}
              />
            )}
          />
        </Input.Wrapper>
        <Input.Wrapper
          style={{ marginBottom: "16px" }}
          classNames={{
            root: styles.input,
            error: styles.error,
            label: styles.label,
          }}
          label="Оценка"
        >
          <Controller
            name="begin"
            control={control}
            render={() => (
              <Input
                placeholder="Оценка"
                onChange={handleEstimateCostChange}
                value={estimateCostText || ""}
                classNames={{ input: styles.field }}
              />
            )}
          />
        </Input.Wrapper>
        <Input.Wrapper
          classNames={{
            root: styles.input,
            error: styles.error,
            label: styles.label,
          }}
          label="Дата начала"
        >
          <Controller
            name="begin"
            control={control}
            render={() => (
              <DatePickerInput
                clearable
                valueFormat="DD MMM YYYY"
                placeholder="Дата начала"
                value={beginText}
                onChange={handleBeginChange}
                rightSection={!beginText && <DatePickerCustomIcon />}
                classNames={{ input: styles.field }}
              />
            )}
          />
        </Input.Wrapper>
        <Input.Wrapper
          classNames={{
            root: styles.input,
            error: styles.error,
            label: styles.label,
          }}
          label="Дата завершения"
        >
          <Controller
            name="end"
            control={control}
            render={() => (
              <DatePickerInput
                clearable
                valueFormat="DD MMM YYYY"
                placeholder="Дата завершения"
                value={endText}
                onChange={handleEndChange}
                rightSection={!endText && <DatePickerCustomIcon />}
                classNames={{ input: styles.field }}
              />
            )}
          />
        </Input.Wrapper>
      </div>
      <Input.Wrapper
        classNames={{ root: styles.description, error: styles.error }}
        error={editor?.getText() === "" ? errors.description?.message : ""}
      >
        <Controller
          name="description"
          control={control}
          rules={reuiredRules}
          render={() => (
            <RichTextEditor
              withTypographyStyles={false}
              withCodeHighlightStyles={false}
              editor={editor}
              className={styles["mantine-RichTextEditor-root"]}
            >
              <RichTextEditor.Toolbar
                className={styles["mantine-RichTextEditor-toolbar"]}
              >
                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.Bold styles={textEditorIconStyles} />
                  <RichTextEditor.Italic styles={textEditorIconStyles} />
                  <RichTextEditor.Code styles={textEditorIconStyles} />
                </RichTextEditor.ControlsGroup>
                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.BulletList styles={textEditorIconStyles} />
                  <RichTextEditor.OrderedList styles={textEditorIconStyles} />
                </RichTextEditor.ControlsGroup>
              </RichTextEditor.Toolbar>
              <RichTextEditor.Content
                className={
                  styles["mantine-RichTextEditor-typographyStylesProvider"]
                }
              />
            </RichTextEditor>
          )}
        />
      </Input.Wrapper>
      <Input.Wrapper className={styles.dropzone}>
        <div className={styles.previews}>
          {taskDetail ? previewsTaskDetail : previews}
        </div>
        <Dropzone
          className={styles["mantine-Dropzone-root"]}
          onDrop={handleDropZoneChange}
          multiple
        >
          <p className={styles.descr}>Выбери файлы или перетащи их сюда</p>
        </Dropzone>
      </Input.Wrapper>
      <div className={styles.lower}>
        <Input.Wrapper
          label="Layout link"
          error={errors.layout_link?.message}
          classNames={{
            root: styles.input,
            error: styles.error,
            label: styles.label,
          }}
        >
          <Controller
            name="layout_link"
            control={control}
            rules={{
              pattern: linkRules,
            }}
            render={({ field }) => (
              <Input
                {...field}
                placeholder="Layout link"
                value={field.value || ""}
                classNames={{ input: styles.field }}
              />
            )}
          />
        </Input.Wrapper>
        <Input.Wrapper
          label="Dev link"
          error={errors.dev_link?.message}
          classNames={{
            root: styles.input,
            error: styles.error,
            label: styles.label,
          }}
        >
          <Controller
            name="dev_link"
            control={control}
            rules={{
              pattern: linkRules,
            }}
            render={({ field }) => (
              <Input
                {...field}
                placeholder="Dev link"
                value={field.value || ""}
                classNames={{ input: styles.field }}
              />
            )}
          />
        </Input.Wrapper>
        <Input.Wrapper
          label="Markup link"
          error={errors.markup_link?.message}
          classNames={{
            root: styles.input,
            error: styles.error,
            label: styles.label,
          }}
        >
          <Controller
            name="markup_link"
            control={control}
            rules={{
              pattern: linkRules,
            }}
            render={({ field }) => (
              <Input
                {...field}
                placeholder="Markup link"
                value={field.value || ""}
                classNames={{ input: styles.field }}
              />
            )}
          />
        </Input.Wrapper>
      </div>
      <div className={styles.buttons}>
        <button className={styles.add} type="submit">
          Добавить
        </button>
        <button
          className={styles.cancel}
          type="button"
          onClick={() => {
            setConfirmationOpened(true);
          }}
        >
          Отмена
        </button>
      </div>
    </form>
  );
};
