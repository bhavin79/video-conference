import { useNavigate } from "react-router-dom";
import { createMeetApiCall } from "../../service/apiCalls";
import { useState } from "react";
import { BiCopy } from "react-icons/bi";
import { FcVideoCall } from "react-icons/fc";
import { useForm } from "react-hook-form";

const CreateMeetForm = () => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [meetid, setMeetingId] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const copyToClipboard = async () => {
    try {
      const permissions = await navigator.permissions.query({
        name: "clipboard-write",
      });
      if (permissions.state === "granted" || permissions.state === "prompt") {
        await navigator.clipboard.writeText(meetid);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const getMeetingId = async (values) => {
    // axios.defaults.withCredentials = true;
    let response;
    try {
      response = await createMeetApiCall({ password: values.password });
      const responseMeetId = response.data.meetId;
      setMeetingId(responseMeetId);
      //    navigate(`/meet/${responseMeetId}`);
    } catch (error) {
      setError(error.response.data.msg);
    }
  };
  const handleStart = () => {
    // navigate(`/meet/${meetid}`);
    navigate(`/meet/${meetid}`);
  };

  return (
    <div className="flex flex-col items-center">
      <form
        className="form-control w-full max-w-xs"
        onSubmit={handleSubmit(getMeetingId)}
      >
        <label htmlFor="password" className="label">
          Password:
        </label>
        <input
          type="password"
          id="password"
          className="input input-bordered w-full max-w-xs text-black"
          placeholder="Add password"
          {...register("password", {
            required: "password is Required",
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
          <p className="label text-orange-600">{errors.password.message}</p>
        )}
        <div className="flex justify-center my-5">
          <button
            className="btn bg-green-500 hover:bg-green-200 border-none"
            type="submit"
          >
            Create
          </button>
        </div>
      </form>

      {meetid && (
        <>
          <div className="flex flex-col">
            <div className="border border-solid flex rounded-lg">
              <input
                className="pl-2 text-black rounded-l-lg "
                value={meetid}
                readonly
              />
              <button
                className="btn h-full btn-md bg-sky-100 "
                onClick={copyToClipboard}
              >
                {" "}
                <BiCopy />{" "}
              </button>
            </div>
          </div>
          <FcVideoCall onClick={handleStart} size="40" />
        </>
      )}
    </div>
  );
};

export default CreateMeetForm;
