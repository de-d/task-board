import { NativeSelect, rem } from "@mantine/core";
import { IconChevronDown } from "@tabler/icons-react";
import styles from "./Select.module.scss";

interface TaskStage {
  name: string;
}

interface TaskDetail {
  possibleTaskNextStages: TaskStage[];
}

interface SelectProps {
  selectValue?: string;
  setSelectValue: (value: string) => void;
  taskDetail?: TaskDetail;
}

export default function Select({
  selectValue,
  setSelectValue,
  taskDetail,
}: SelectProps) {
  return (
    <NativeSelect
      className={styles.select}
      value={selectValue}
      data={taskDetail?.possibleTaskNextStages.map((item) => item.name) || []}
      onChange={(event) => setSelectValue(event.currentTarget.value)}
      variant="filled"
      size="md"
      rightSection={
        <IconChevronDown style={{ width: rem(16), height: rem(16) }} />
      }
    />
  );
}
