import CryptoJS from "crypto-js";
import { v4 as uuidv4 } from "uuid";

const clientId = 37;
const secretKey = "922fa962-5c59-4467-9836-80f292d6409e";

export const createOrder = async (amount: number) => {
  const orderId = uuidv4();
  const sign = CryptoJS.MD5(`${orderId}:${amount}:rub:${secretKey}`).toString();

  console.log("client_id:", clientId);
  console.log("order_id:", orderId);
  console.log("amount:", amount);
  console.log("sign:", sign);

  const url = `https://apays.io/backend/create_order_to_p2p_market?client_id=${clientId}&order_id=${orderId}&amount=${amount}&api_type=rub&sign=${sign}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      console.error("HTTP error:", response.status);
      return { status: false };
    }

    const result = await response.json();
    console.log("Платеж создался: ", result);
    return { ...result, orderId };
  } catch (error) {
    console.error("Fetch error:", error);
    return { status: false };
  }
};

export const setPayedStatus = async (orderId: string) => {
  const sign = CryptoJS.MD5(`${orderId}:${secretKey}`).toString();
  const url = `https://apays.io/backend/set_status_payed?client_id=${clientId}&order_id=${orderId}&sign=${sign}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();
  console.log("Установлен статус платежа ", data);
  return response;
};

export const handleUpload = async (file: File | null, orderId: string) => {
  const sign = CryptoJS.MD5(`${orderId}:${secretKey}`).toString();
  if (!file || !orderId) {
    throw new Error("Выберите файл и дождитесь создания заказа");
  }

  const formData = new FormData();
  formData.append("file", file);

  try {
    const url = `https://apays.io/backend/upload_file_from_api/${orderId}?client_id=${clientId}&sign=${sign}`;

    const response = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Ошибка загрузки файла: ${response.status} - ${errorText}`
      );
    }

    const data = await response.json();
    console.log("Изображение отправлено", data);
  } catch (error) {
    console.error("Ошибка", error);
  }
};
