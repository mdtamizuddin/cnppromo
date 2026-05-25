import { Image } from "antd";
import { Button, Input } from "antd";
import { Select } from "antd";
import { Form } from "antd";
import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { api } from "../../../util/axios";
import { Spin } from "antd";

const Create = ({ setStep }) => {
  const { user } = useSelector((state) => state.user);
  const [file, setFile] = useState(null);
  const [publicUrl, setPublicUrl] = useState("");
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
    if (!image && !file) {
      return toast.error("Please upload a video or screenshot");
    }
    try {
      setIsLoading(true);
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
        video,
        image: imageLink,
        method: e.method,
        account: e.account,
        user: user?._id,
      };
      const res = await api.post("/external-withdraw", data);
      toast.success(
        "Thank you for withdrawing. You will receive your payment within 24 hours."
      );
      setIsLoading(false);
      setStep("2");
    } catch (error) {
      setIsLoading(false);
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Something went wrong"
      );
    }
  };
  return (
    <div>
      <Spin spinning={isLoading} size="large" fullscreen />
      <Form
        name="basic"
        initialValues={{ method: "Bkash" }}
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
        <Form.Item label="Payment Method" required name={"method"}>
          <Select>
            <Select.Option value="Bkash">Bkash</Select.Option>
            <Select.Option value="Nagad">Nagad</Select.Option>
            <Select.Option value="Rocket">Rocket</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="Personal Account Number" required name={"account"}>
          <Input placeholder="Please Enter Account Number Here" required />
        </Form.Item>

        <Form.Item>
          <Button htmlType="submit">Submit</Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Create;
