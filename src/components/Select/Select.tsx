import { NativeSelect, rem } from "@mantine/core";
import { IconChevronDown } from "@tabler/icons-react";
import styles from "./Select.module.scss";
import { TaskDetailResponse } from "@/types/Task";

interface SelectProps {
  selectValue?: string;
  setSelectValue: (value: string) => void;
  taskDetail?: TaskDetailResponse;
}

export default function Select({ selectValue, setSelectValue, taskDetail }: SelectProps) {
  return (
    <NativeSelect
      className={styles.select}
      value={selectValue}
      data={taskDetail?.data.possibleTaskNextStages.map((item) => item.name) || []}
      onChange={(event) => setSelectValue(event.currentTarget.value)}
      variant="filled"
      size="md"
      rightSection={<IconChevronDown style={{ width: rem(16), height: rem(16) }} />}
    />
  );
}
