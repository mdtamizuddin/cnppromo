const logoProvider = (account) => {
  switch (account) {
    case "bkash":
      return "/logo/bkash.png";
    case "nagad":
      return "/logo/nagad.png";
    case "rocket":
      return "/logo/rocket.png";
    case "upay":
      return "/logo/upay.png";
    case "bank":
      return "/logo/bank.png";
    case "mobile recharge":
      return "/logo/recharge.png";
    default:
      return "/default-logo.png";
  }
};

export default logoProvider;
