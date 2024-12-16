import { useRouter } from 'next/router';
import TaskDetail from "@/components/TaskDetail/TaskDetail";
import React from "react";
import ProjectsLayout from "@/pages/projects/layout";

export default function TaskId() {
    const router = useRouter();
    const { taskId } = router.query;

    if (!taskId) {
        return <div>Loading...</div>;
    }

    return (
        <TaskDetail taskId={Number(taskId)} modal={false}/>
    );
}

TaskId.getLayout = (page: React.ReactNode) => <ProjectsLayout>{page}</ProjectsLayout>;