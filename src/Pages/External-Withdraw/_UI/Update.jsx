import { Button, Form } from "antd";
import { Image } from "antd";
import { Select } from "antd";
import { Input } from "antd";
import { Modal } from "antd";
import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { useSelector } from "react-redux";
import { api } from "../../../util/axios";
import toast from "react-hot-toast";

const Update = ({ show, setShow, data: oldData, refetch }) => {
  const { user } = useSelector((state) => state.user);
  const [file, setFile] = useState(null);
  const [publicUrl, setPublicUrl] = useState(oldData?.video);
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(oldData?.image);
  useEffect(() => {
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPublicUrl(objectUrl);
      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    }
  }, [file]);
  useEffect(() => {
    if (image) {
      const objectUrl = URL.createObjectURL(image);
      setImageUrl(objectUrl);
      return () => {
        URL.revokeObjectURL(objectUrl);
      };
    }
  }, [image]);
  const submitHandler = async (e) => {
    try {
      let video;
      let imageLink;
      if (file) {
        const data = new FormData();
        data.append("image", file);
        const res = await api.post("/upload", data);
        video = res.data.url;
      }
      if (image) {
        const data = new FormData();
        data.append("image", image);
        const res = await api.post("/upload", data);
        imageLink = res.data.url;
      }
      const data = {
        video: video || oldData?.video,
        image: imageLink || oldData?.image,
        method: e.method,
        account: e.account,
      };
      const res = await api.put(`/external-withdraw/${oldData?._id}`, data);
      toast.success(
        "Thank you for withdrawing. You will receive your payment within 24 hours."
      );
      refetch();
      setShow(false);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong"
      );
    }
  };
  return (
    <div>
      <Modal
        title="Update Your Withdrawal"
        open={show}
        onOk={() => setShow(false)}
        onCancel={() => setShow(false)}
        footer={null}
      >
        <Form
          name="basic"
          initialValues={{ method: oldData?.method, account: oldData?.account }}
          layout="vertical"
          onFinish={submitHandler}
        >
          <Form.Item label="Submit Video">
            {publicUrl && (
              <video src={publicUrl} controls width={300} className="mb-2" />
            )}
            <Input
              type="file"
              accept="video/*"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </Form.Item>
          {/* And Screenshoot */}
          <Form.Item label="Submit Screenshot">
            {imageUrl && (
              <Image src={imageUrl} alt="File" width={300} className="mb-2" />
            )}
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
            />
          </Form.Item>
          <Form.Item label="Payment Method"  name={"method"}>
            <Select>
              <Select.Option value="Bkash">Bkash</Select.Option>
              <Select.Option value="Nagad">Nagad</Select.Option>
              <Select.Option value="Rocket">Rocket</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="Personal Account Number"  name={"account"}>
            <Input placeholder="Please Enter Account Number Here" required />
          </Form.Item>

          <Form.Item>
            <Button htmlType="submit">Submit</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Update;
