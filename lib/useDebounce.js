"use client";
import { useState, useEffect } from "react";

// Trả về `value` sau khi nó ngừng thay đổi trong `delay` ms.
// Dùng để debounce ô tìm kiếm — tránh gọi API mỗi lần gõ phím.
export default function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}
