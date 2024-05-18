import { useState, useEffect } from "react";
import { historyApiCall } from "../../service/apiCalls";
import { IoIosSearch } from "react-icons/io";
import { useAuth } from "../conextAPI/authContext";
import { useNavigate } from "react-router-dom";

export const Sidebar = ({
  handleCall,
  remoteStream,
  reload,
  handleLocalCallEnd,
}) => {
  const [history, setHistory] = useState([]);
  const [emailId, setEmailId] = useState("");
  const [makeCall, setMakeCall] = useState(false);
  const { logoutHandle } = useAuth();
  const navigate = useNavigate();

  const fectchHistory = async () => {
    try {
      let response = await historyApiCall();
      setHistory(response.data);
    } catch (error) {
      logoutHandle();
      return navigate("/login");
    }
  };
  useEffect(() => {
    fectchHistory();
  }, [reload]);

  useEffect(() => {
    if (remoteStream) {
      setMakeCall(false);
    }
  }, [remoteStream]);

  const getColor = () => {
    if (remoteStream) {
      return "bg-gray-400";
    }
    return "bg-white";
  };

  return (
    <div className="">
      <div className="flex flex-col">
        <div className="flex flex-row">
          <label className="input input-bordered flex items-center gap-2 h-10 w-80">
            {/* Search input */}
            <IoIosSearch />
            <input
              name="emailId"
              className="grow py-1"
              type="email"
              placeholder="email"
              value={emailId}
              onChange={(e) => setEmailId(e.target.value)}
            />
          </label>

          {/* Call button */}
          <button
            disabled={remoteStream}
            className={`ml-5 slef-end rounded-md px-3 py-2 border h-10 ${getColor()}`}
            onClick={async () => {
              setMakeCall(true);
              handleCall(emailId);
            }}
          >
            Call
          </button>
        </div>
        <div className="pt-4 flex flex-col divide-y-[0.5px] divide-[#7597BF]">
          {/* Call history */}
          {history.length > 0 &&
            history.map((his, index) => {
              let accepted = his.Accpeted ? "Accepted" : "Rejected";
              his.calleeEmailId =
                his.calleeEmailId[0].toUpperCase() + his.calleeEmailId.slice(1);
              let timeDate = new Date(his.Timestamp);
              const yesterdayDate = new Date();

              if (
                yesterdayDate.toISOString().split("T")[0] ==
                timeDate.toISOString().split("T")[0]
              ) {
                let ampm = timeDate.getHours() >= 12 ? "PM" : "AM";
                let hours = timeDate.getHours() % 12;
                hours = hours ? hours : 12;
                let minutes =
                  timeDate.getMinutes() < 10
                    ? "0" + timeDate.getMinutes()
                    : timeDate.getMinutes();
                timeDate = `${hours}: ${minutes} ${ampm}`;
              } else {
                timeDate = `${timeDate.getMonth() + 1}/${timeDate.getDate()}`;
              }
              return (
                <div className="flex flex-col my-2 p-4" key={index}>
                  <span className="flex flex-row justify-between">
                    <p>{his.calleeEmailId}</p>
                    <p className="">{accepted}</p>
                  </span>
                  <p className="self-start">{timeDate}</p>
                </div>
              );
            })}
        </div>
      </div>
      {/* Make Call Pop UP */}

      {makeCall && (
        <dialog open id={"MakeCallAgain"} className="modal">
          <div className="modal-box">
            <p className="text-xl">You are calling {emailId}</p>
            <form method="dialog">
              <div className="flex justify-evenly my-4">
                <button
                  className="btn hover:bg-red-500"
                  onClick={() => {
                    setMakeCall(false);
                    handleLocalCallEnd();
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </dialog>
      )}
    </div>
  );
};
