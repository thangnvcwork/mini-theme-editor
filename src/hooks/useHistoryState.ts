import { useReducer, useCallback } from "react";

//cấu trúc lưu lại lịch sử: quá khứ, hiện tại, tương lai
type HistoryState<T> = {
  past: T[];
  present: T;
  future: T[];
};

//các hành động có thể xảy ra với history bằng cú pháp Union
type Action<T> =
  | { type: "SET"; payload: T | ((prev: T) => T) } //dữ liệu gửi lên có thể là một giá trị mới tinh hoặc là một hàm cập nhật vào giá trị cũ và trả về giá trị mới
  | { type: "UNDO" }
  | { type: "REDO" }
  | { type: "HYDRATE"; payload: T}; // MỚI: nạp dữ liệu từ ngoài, không ghi lịch sử

// Reducer: nhận state hiện tại + 1 action, trả về state MỚI
// Đây là hàm thuần (pure function) - không side effect, không random, cùng input luôn ra cùng output
//nhưng cú pháp của useReducer tách riêng — tham số 2 là giá trị truyền cho tham số 3
//(hàm khởi tạo), dùng khi việc tính state ban đầu tốn kém (ở đây là đọc localStorage).
function historyReducer<T>(
  state: HistoryState<T>, //dùng Generic vì cần phải dùng được cho mọi loại dữ liệu, ví dụ khi dùng thì chữ T lập tức được thay thế bằng page
  action: Action<T>,
): HistoryState<T> {
  switch (action.type) {
    case "SET": {
      const newValue =
        typeof action.payload === "function"
          ? (action.payload as (prev: T) => T)(state.present) // ép kiểu khẳng định chắc chắn 100% payload là một hàm
          : action.payload;

      if (newValue === state.present) return state; // không đổi gì thì giữ nguyên, tránh lưu lịch sử thừa

      return {
        past: [...state.past, state.present], // đẩy giá trị hiện tại vào quá khứ
        present: newValue,
        future: [], // có thay đổi mới → xoá hết "tương lai" cũ (không redo lại được nữa)
      };
    }

    case "HYDRATE": {
      // Thay thế present trực tiếp, RESET sạch past/future
      // Vì đây là dữ liệu "gốc" mới nạp vào, không phải 1 bước chỉnh sửa của người dùng
      return {
        past: [],
        present: action.payload,
        future: [],
      };
    }

    case "UNDO": {
      if (state.past.length === 0) return state; //không có gì để lùi
      const previous = state.past[state.past.length - 1];
      return {
        past: state.past.slice(0, -1), //bỏ phần tử cuối ra khỏi quá khứ
        present: previous,
        future: [state.present, ...state.future], //đẩy hiện tại vào đầu tương lai
      };
    }

    case "REDO": {
      if (state.future.length === 0) return state; //không có gì để tiến
      const next = state.future[0];
      return {
        past: [...state.past, state.present],
        present: next,
        future: state.future.slice(1),
      };
    }

    default:
      return state;
  }
}

export function useHistoryState<T>(initialValue: T | (() => T)) {
  const [state, dispatch] = useReducer(historyReducer<T>, undefined, () => ({
    //Thay vì gọi trực tiếp setPage(newValue), useReducer yêu cầu bạn "gửi 1 hành động" (dispatch) mô tả điều gì đã xảy ra
    //rồi để reducer tự quyết định state mới sẽ ra sao.
    //useState là "đặt giá trị trực tiếp", useReducer là "mô tả sự kiện, để logic tập trung 1 chỗ xử lý".
    //Lazy Initialization
    // useReducer(reducerFn, initialArg, initFn)
    // reducerFn: hàm (state, action) => newState — "bộ não" xử lý mọi thay đổi.
    //initialArg + initFn: giống lazy initializer đã học ở Bước 8 (useState(() => ...))
    past: [],
    present:
      typeof initialValue === "function"
        ? (initialValue as () => T)()
        : initialValue,
    future: [],
  }));

  //setState giữ đúng "chữ ký" giống useState thật (nhận giá trị hoặc hàm updater)
  //code tối ưu hiệu năng khi chỉ chạy lần đầu
  const setState = useCallback((valueOrUpdate: T | ((prev: T) => T)) => {
    dispatch({ type: "SET", payload: valueOrUpdate });
  }, []);

  // MỚI: dùng khi nạp dữ liệu từ nguồn ngoài (server, localStorage...), KHÔNG tính là bước Undo
  const hydrate = useCallback((value: T) => {
    dispatch({ type: "HYDRATE", payload: value });
  }, []);

  const undo = useCallback(() => dispatch({ type: "UNDO" }), []);
  const redo = useCallback(() => dispatch({ type: "REDO" }), []);

  return {
    state: state.present,
    setState,
    hydrate,
    undo,
    redo,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
  };
}
