async function purchaseDuck() {
  try {
    const response = await fetch("/api/users/purchaseduck");
    if (!response.ok) {
      throw new Error("오리를 구매하는데 실패했습니다.");
    }
  } catch (error) {
    console.error(error);
  }
}

export { purchaseDuck };
