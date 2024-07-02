import { useEffect, useState } from "react";
import { createOrder, setPayedStatus, handleUpload } from "../aPayas";

interface Order {
  status?: boolean;
  payment_id?: number;
  requisites?: string;
  pm_name?: string;
  amount_on_currency?: number;
  comment?: string;
  orderId?: string;
}
function App() {
  const [order, setOrder] = useState<Order>(() => {
    const storedOrder = localStorage.getItem("order");
    return storedOrder ? JSON.parse(storedOrder) : {};
  });
  const [amount, setAmount] = useState<number | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [visibImage, setVisibImage] = useState(false);
  const [modal, setModal] = useState(false);
  const [textStatus, setTextStatus] = useState("");

  const handleCreateOrder = async (amount: number) => {
    if (amount) {
      const result = await createOrder(amount);
      if (result.status) {
        setOrder(result);
        setModal(true);
        setTextStatus("Следуйте инструкции");
      }
    }
  };

  const handleSelectCard = (e: any) => {
    if (e.target !== e.currentTarget) {
      const amount = parseInt(e.target.textContent, 10);
      setAmount(amount);
    }
  };

  useEffect(() => {
    localStorage.setItem("order", JSON.stringify(order));
  }, [order]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleFileUpload = async () => {
    if (!file || !order.orderId) {
      setStatusMessage("Выберите файл и дождитесь создания заказа");
      return;
    }

    try {
      setModal(true);
      setTextStatus("Файл успешно загружен");
      setOrder({});
    } catch (error) {
      console.error("Ошибка загрузки файла:", error);
      setStatusMessage("Ошибка загрузки файла");
    }
  };

  const handlePaid = async () => {
    if (order.orderId != null) {
      const data = await setPayedStatus(order.orderId);
      if (data.status) {
        setVisibImage(true);
        setModal(true);
        setTextStatus("Загрузите чек оплаты");
      }
    }
  };

  useEffect(() => {
    setTimeout(() => {
      setModal(false);
    }, 3000);
  }, [modal]);
  return (
    <>
      <div className="bg-[#131318] min-h-screen text-white w-full flex items-center justify-center flex-col gap-10">
        <div className="bg-[#1e1d24] rounded-xl w-max p-5 border border-[#34333b]">
          <h2 className="text-center mb-5">Выберите товар</h2>
          <div
            className="grid grid-cols-3 gap-3 cards"
            onClick={handleSelectCard}
          >
            <div className="bg-[#131318] rounded border border-[#34333b] text-center px-14 py-3 text-nowrap flex items-center justify-center cursor-pointer">
              1 Р
            </div>
            <div className="bg-[#131318] rounded border border-[#34333b] text-center px-14 py-3 text-nowrap flex items-center justify-center cursor-pointer">
              100 Р
            </div>
            <div className="bg-[#131318] rounded border border-[#34333b] text-center px-14 py-3 text-nowrap flex items-center justify-center cursor-pointer">
              200 Р
            </div>
            <div className="bg-[#131318] rounded border border-[#34333b] text-center px-14 py-3 text-nowrap flex items-center justify-center cursor-pointer">
              300 Р
            </div>
            <div className="bg-[#131318] rounded border border-[#34333b] text-center px-14 py-3 text-nowrap flex items-center justify-center cursor-pointer">
              400 Р
            </div>
            <div className="bg-[#131318] rounded border border-[#34333b] text-center px-14 py-3 text-nowrap flex items-center justify-center cursor-pointer">
              500 Р
            </div>
          </div>

          {amount && (
            <div>
              <div className="text-center mt-4">Выбранная позиция</div>
              <div>
                <div className="bg-[#131318] rounded border border-[#34333b] text-center px-14 py-3 text-nowrap flex items-center justify-center w-max mx-auto">
                  {amount} Р
                </div>
              </div>
            </div>
          )}

          <div>
            <div
              onClick={() => handleCreateOrder(amount!)}
              className="cursor-pointer bg-[#131318] py-1 px-5 rounded-xl transition hover:bg-[#3a3c42] active:scale-95 mt-5 w-max mx-auto"
            >
              Оплатить
            </div>
          </div>
        </div>

        <div
          className={`transition absolute bg-[#1e1d24] py-1 px-10 rounded-xl border border-[#34333b] top-5 ${
            textStatus === "Файл успешно загружен"
              ? "text-green-400"
              : "text-orange-200"
          } ${modal ? "-translate-y-0" : "-translate-y-40"}`}
        >
          {textStatus}
        </div>

        {order.status !== undefined && order.status ? (
          <div className="bg-[#1e1d24] p-5 rounded-xl border border-[#34333b]">
            <div className="flex flex-col">
              Ревизиты для оплаты:
              <ul>
                <li>Переведите {order.amount_on_currency} Р</li>
                <li>На карту {order.pm_name}</li>
                <li>{order.requisites}</li>
              </ul>
              <div className="flex gap-5">
                <div
                  className="cursor-pointer hover:bg-[#131318] py-1 px-5 rounded-xl transition bg-[#3a3c42] active:scale-95 mt-5 w-max mx-auto"
                  onClick={handlePaid}
                >
                  Я оплатил
                </div>
                <div
                  onClick={() => setOrder({})}
                  className="cursor-pointer hover:bg-[#131318] py-1 px-5 rounded-xl transition bg-[#3a3c42] active:scale-95 mt-5 w-max mx-auto"
                >
                  Отменить оплату
                </div>
              </div>
            </div>
          </div>
        ) : null}
        {visibImage && Object.keys(order).length > 0 ? (
          <div className="mx-auto mt-5 bg-[#1e1d24] p-5 rounded-xl border border-[#34333b] flex flex-col items-center justify-center">
            <div className="flex changefile">
              <label htmlFor="file" className="text-white">
                Выберите файл:
              </label>
              <input type="file" id="file" onChange={handleFileChange} />
            </div>
            <button
              onClick={handleFileUpload}
              className="cursor-pointer hover:bg-[#131318] py-1 px-5 rounded-xl transition bg-[#3a3c42] active:scale-95 mx-auto mt-10"
            >
              Загрузить
            </button>
            <p>{statusMessage}</p>
          </div>
        ) : null}
      </div>
    </>
  );
}

export default App;
