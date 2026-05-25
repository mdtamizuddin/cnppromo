import { Select, Option } from "@material-tailwind/react";

export default function Status({ state, setState }) {
    return (
        <div className="w-72 p-2">
            <Select label="Select Status" value={state} onChange={(e) => setState(e)}>
                <Option value="pending">Pending</Option>
                <Option value="completed">Completed</Option>
                <Option value="rejected">Rejected</Option>
            </Select>
        </div>
    );
}