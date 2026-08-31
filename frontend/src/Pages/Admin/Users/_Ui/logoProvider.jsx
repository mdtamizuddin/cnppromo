const logoProvider = (account) => {
  if (!account) return "/logo/bkash.png";
  const name = String(account).toLowerCase().trim();

  if (name.includes("bkash")) return "/logo/bkash.png";
  if (name.includes("nagad")) return "/logo/nagad.png";
  if (name.includes("rocket")) return "/logo/rocket.png";
  if (name.includes("bank")) return "/logo/bank.png";
  if (name.includes("upay")) return "/logo/upay.png";
  if (name.includes("recharge")) return "/logo/recharge.png";
  if (name.includes("paypal")) return "/logo/paypal.svg";
  if (name.includes("stripe")) return "/logo/stripe.svg";
  if (name.includes("payeer")) return "/logo/payeer.svg";
  if (name.includes("binance") || name.includes("usdt") || name.includes("crypto")) return "/logo/binance.svg";

  return "/logo/bank.png";
};

export default logoProvider;
