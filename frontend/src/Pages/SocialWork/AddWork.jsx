import React from "react";
import { Button, Input, Spin, Select, Form } from "antd";
import { api } from "../../util/axios";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "react-query";
import { Popconfirm } from "antd";

const AddWork = () => {
  const [question, setQuestion] = React.useState("");
  const [questionList, setQuestionList] = React.useState([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const navigate = useNavigate();
  const { id } = useParams();

  const { data, isLoading } = useQuery({
    queryKey: ["works", id],
    queryFn: async () => {
      const res = await api.get(`social-works/${id}`);
      if (res.data.questions) {
        setQuestionList(res.data.questions);
      }
      return res.data;
    },
    enabled: !!id,
  });

  const onSubmit = async (values) => {
    const payload = {
      ...values,
      questions: questionList,
    };
    try {
      setIsSubmitting(true);
      if (id) {
        await api.put(`social-works/${id}`, payload);
        toast.success("Work Updated Successfully");
      } else {
        await api.post("social-works/create", payload);
        toast.success("Work Created Successfully");
      }
      navigate(`/social-works`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteWork = async () => {
    try {
      await api.delete(`social-works/${id}`);
      toast.success("Work Deleted Successfully");
      navigate(`/social-works`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  if (isLoading) {
    return <Spin fullscreen />;
  }

  return (
    <div className="min-h-screen container mx-auto py-10 px-4">
      <Toaster />
      <h2 className="text-2xl mb-10 font-semibold text-center">
        {data ? "Update Work" : "Add Work"}
      </h2>

      <Form
        layout="vertical"
        initialValues={{
          title: data?.title || "",
          description: data?.description || "",
          url: data?.url || "",
          duration: data?.duration || 0,
          price: data?.price || 0,
          status: data?.status || "active",
        }}
        onFinish={onSubmit}
      >
        <Form.Item
          label="Title"
          name="title"
          rules={[{ required: true, message: "Please input your title!" }]}
        >
          <Input placeholder="Enter Work Title" />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[
            { required: true, message: "Please input your description!" },
          ]}
        >
          <Input.TextArea placeholder="Enter Description" />
        </Form.Item>

        <Form.Item
          label="Status"
          name="status"
          rules={[{ required: true, message: "Please select your status!" }]}
        >
          <Select placeholder="Select Status">
            <Select.Option value="active">Active</Select.Option>
            <Select.Option value="inactive">Inactive</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Video URL"
          name="url"
          rules={[{ required: true, message: "Please input your video URL!" }]}
        >
          <Input
            type="url"
            placeholder="https://www.youtube.com/watch?v=crdh79ZGro0"
          />
        </Form.Item>

        <Form.Item
          label="Video Duration (in seconds)"
          name="duration"
          rules={[
            { required: true, message: "Please input your video duration!" },
          ]}
        >
          <Input type="number" placeholder="Enter Duration" />
        </Form.Item>

        <Form.Item
          label="Price"
          name="price"
          rules={[{ required: true, message: "Please input your price!" }]}
        >
          <Input type="number" placeholder="Enter Price" />
        </Form.Item>

        {/* Questions Section */}
        <div className="flex flex-col mb-6">
          <h2 className="text-sm font-semibold mb-2">Questions</h2>
          <ol className="list-decimal list-inside space-y-2 mb-4">
            {questionList.map((q, i) => (
              <li key={i} className="flex items-center gap-2">
                <Input.TextArea
                  size="small"
                  value={q}
                  onChange={(e) => {
                    const newList = [...questionList];
                    newList[i] = e.target.value;
                    setQuestionList(newList);
                  }}
                />
                <Button
                  danger
                  size="small"
                  onClick={() => {
                    setQuestionList(
                      questionList.filter((_, index) => index !== i)
                    );
                  }}
                >
                  Remove
                </Button>
              </li>
            ))}
          </ol>

          <div className="flex items-end gap-x-4">
            <Input.TextArea
              placeholder="Enter Question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <Button
              type="primary"
              disabled={!question.trim()}
              onClick={() => {
                if (question.trim()) {
                  setQuestionList([...questionList, question.trim()]);
                  setQuestion("");
                }
              }}
            >
              Add
            </Button>
          </div>
        </div>

        <Form.Item>
          <div className="flex justify-between items-center">
            <Button type="primary" htmlType="submit" loading={isSubmitting}>
              {id ? "Update Work" : "Create Work"}
            </Button>
            <Popconfirm
              title="Are you sure to delete this work?"
              onConfirm={handleDeleteWork}
            >
              <div className="bg-red-500 cursor-pointer px-4 py-1 rounded text-white">
                Delete Work
              </div>
            </Popconfirm>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
};

export default AddWork;
