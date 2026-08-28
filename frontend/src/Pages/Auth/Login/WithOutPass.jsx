import { Card } from "@material-tailwind/react";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import InputFeild from "../InputFeild";
import "react-phone-number-input/style.css";
import { Button } from "@material-tailwind/react";
import { api } from "../../../util/axios";
import Cookie from "js-cookie";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { Form } from "antd";
import { Input } from "antd";
const LoginWithoutPass = () => {
  const [data, setData] = React.useState({
    email: "",
    password: "",
  });

  const { user } = useSelector((state) => state.user);

  useEffect(() => {
    if (user) {
      if (user.role === 'admin' || user.role === 'moderator') {
        window.location.href = "/admin";
      } else {
        window.location.href = "/user/home";
      }
    }
  }, [user]);
  const updateState = (e, e2) => {
    if (!e2) {
      setData({ ...data, [e.target.name]: e.target.value });
    } else {
      setData({ ...data, [e2]: e });
    }
  };

  const [error, setError] = React.useState("");
  const SubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const res = await api.get(`/user/pass-less?email=${data.email}`);
      setError("");
      Cookie.set("token-you", res.data.token, { expires: 30 });
      toast.success("Login Successful");
      const tokenPayload = JSON.parse(atob(res.data.token.split('.')[1]));
      if (tokenPayload.role === 'admin' || tokenPayload.role === 'moderator') {
          window.location.href = "/admin";
      } else {
          window.location.href = "/user/welcome";
      }
    } catch (error) {
      setError(
        error.response.data.message || error.message || "Something went wrong"
      );
    }
  };
  const rootPass = "password nai";
  const [open, setOpen] = React.useState(false);
  if (!open) {
    return (
      <div className="container mx-auto min-h-[80vh] flex flex-col items-center justify-center">
        <Form
        onFinish={(e) => {
          if (e.password === rootPass) {
            setOpen(true);
          } else {
            toast.error(e.password);
          }
        }}
        className="w-full"
        layout="vertical"
      >
        <Form.Item name="password" label="Enter Root Password">
          <Input.Password />
        </Form.Item>
        <Form.Item>
          <Button type="submit">Submit</Button>
        </Form.Item>
      </Form>
      </div>
    );
  }
  return (
    <div className="container mx-auto mt-20 min-h-[80vh]">
      <Card className="p-10 max-w-[800px] mx-auto">
        <h1 className="text-2xl font-semibold">Sign In To Your Account</h1>
        <form
          onSubmit={(e) => SubmitHandler(e)}
          className="flex flex-col mt-10 gap-x-5 gap-y-8"
        >
          <InputFeild
            label="Email"
            type="text"
            name="email"
            placeholder="Enter Your Email"
            value={data.email}
            onChange={(e) => updateState(e)}
            required
            className="col-span-2"
          />
          <p className="text-red-500 text-xs col-span-2">{error}</p>
          <div className="col-span-2 flex justify-center ">
            <Button type="filled" color="green" className="px-10">
              Login
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default LoginWithoutPass;
