import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { loginApiCall } from "../../service/apiCalls";
import { useAuth } from "../conextAPI/authContext";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useEffect } from "react";

const LoginForm = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const { loginHandle } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  useEffect(() => {
    let emailId = localStorage.getItem("username");
    if (emailId) {
      return navigate("/");
    }
  }, []);

  const sendLoginCredentials = async (formData) => {
    try {
      const data = { emaildId: formData.emailId, password: formData.password };
      let response = await loginApiCall(data);
      console.log(response);
      loginHandle();
      localStorage.setItem("username", formData.emailId);
      navigate("/");
    } catch (error) {
      setError(error.response.data.msg);
    }
    return;
  };

  return (
    <div className="flex justify-center h-screen items-center">
      <div className="card md:w-1/3 w-full md:h-[600px]  h-full bg-neutral md:rounded-2xl rounded-none text-neutral-content shadow-lg md:py-16 py-[200px] px-5">
        <div className="card-body items-center text-center">
          <h2 className="card-title mb-5 text-3xl">Login!</h2>
          <form
            className="form-control w-full max-w-xs"
            onSubmit={handleSubmit(sendLoginCredentials)}
          >
            <div className="mb-2 ">
              <label htmlFor="emailId" className="label">
                Email Id:{" "}
              </label>
              <input
                type="email"
                id="emailId"
                className="input input-bordered w-full max-w-xs text-black"
                placeholder="Add Email Id"
                {...register("emailId", {
                  required: "Email address is required",
                  validate: {
                    justSpaces: (name) => {
                      if (name.trim().length == 0) {
                        return "email address can't be empty spaces";
                      }
                    },
                  },
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "invalid email address",
                  },
                })}
              />
              {errors && errors.emailId && (
                <p className="label text-orange-600">
                  {errors.emailId.message}
                </p>
              )}
            </div>

            <div className="mb-8">
              <label htmlFor="password" className="label">
                Password{" "}
              </label>
              <input
                type="password"
                id="password"
                className="input input-bordered w-full max-w-xs text-black"
                placeholder="Add password"
                {...register("password", {
                  required: "Password is required",
                  validate: {
                    justSpaces: (name) => {
                      if (name.trim().length == 0) {
                        return "password can't be empty spaces";
                      }
                    },
                  },
                })}
              />
              {errors && errors.password && (
                <p className="label text-orange-600">
                  {errors.password.message}
                </p>
              )}
            </div>
            <button className="btn w-2/4 self-center mb-6" type="submit">
              Login!
            </button>
          </form>
          <p className="text-base">
            {" "}
            Dont have an account?{" "}
            <Link
              to="/signup"
              className="text-lime-600 hover:text-lime-400 hover:cursor-pointer"
            >
              click here
            </Link>{" "}
            to create one
          </p>
        </div>
        {error && <p className="text-orange-600">{error}</p>}
      </div>
    </div>
  );
};
const LoginScreen = () => {
  return (
    <div>
      <LoginForm />
    </div>
  );
};
export default LoginScreen;
