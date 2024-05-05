import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { signUpApiCall } from "../../service/apiCalls";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";

const SignUpForm = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  useEffect(() => {
    let emailId = localStorage.getItem("username");
    if (emailId) {
      return navigate("/");
    }
  }, []);

  const sendSignUpCredentials = async (formData) => {
    const data = {
      emaildId: formData.emailId,
      password: formData.password,
    };
    try {
      let response = await signUpApiCall(data);
      // let response = await axios.post(`${baseURL}/user/signup`, );
      navigate(`/login`);
    } catch (error) {
      console.log(error);
      setError(error.response.data.msg);
    }
  };
  return (
    <div className="flex justify-center h-screen items-center">
      <div className="card md:w-1/3 w-full md:h-[700px]  h-full bg-neutral md:rounded-2xl rounded-none text-neutral-content shadow-lg md:py-16 py-[200px] px-5">
        <div className="card-body items-center text-center">
          <h2 className="card-title mb-5 text-3xl">SignUp!</h2>
          <form
            className="form-control w-full max-w-xs"
            onSubmit={handleSubmit(sendSignUpCredentials)}
          >
            <div className="mb-2">
              <label htmlFor="emailId" className="label">
                Email Id:{" "}
              </label>
              <input
                type="email"
                id="emailId"
                className="input input-bordered w-full max-w-xs"
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
                className="input input-bordered w-full max-w-xs"
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
            <div className="mb-8">
              <label htmlFor="rePassword" className="label">
                Confirm Password{" "}
              </label>
              <input
                type="password"
                id="rePassword"
                className="input input-bordered w-full max-w-xs"
                placeholder="Confirm password"
                {...register("rePassword", {
                  required: "Password is required",
                  validate: (val) => {
                    if (watch("password") != val) {
                      return "Passwords do no match";
                    }
                  },
                })}
              />
              {errors && errors.rePassword && (
                <p className="label text-orange-600">
                  {errors.rePassword.message}
                </p>
              )}
            </div>
            <button className="btn w-2/4 self-center mb-6" type="submit">
              SingUp!
            </button>
          </form>
          <p className="text-base">
            {" "}
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-lime-600 hover:text-lime-400 hover:cursor-pointer"
            >
              click here
            </Link>{" "}
            to login
          </p>
        </div>
        {error && <p className="text-orange-600">{error}</p>}
      </div>
    </div>
  );
};
const SignupScreen = () => {
  return (
    <>
      <SignUpForm />
    </>
  );
};
export default SignupScreen;
