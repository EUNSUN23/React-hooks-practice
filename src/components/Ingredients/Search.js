import React, { useState, useEffect, useRef } from "react";

import Card from "../UI/Card";
import useHttp from "../../hooks/http";
import "./Search.css";
import ErrorModal from "../UI/ErrorModal";

const Search = React.memo((props) => {
  const { onLoadIngredients } = props;
  const [enteredFilter, setEnteredFilter] = useState("");
  const inputRef = useRef();
  const { isLoading, data, error, sendRequest, clear } = useHttp();

  useEffect(() => {
    const timer = setTimeout(() => {
      //keystroke마다 req보내지 않고 타이핑 완료하면 req보내도록 setTimeout.
      //enteredFilter : 현재 value가 아니라 0.5초 전의 value값. (0.5초전에 setTimeout함수 생성하면서
      //그 때의 enteredFilter값이 담겨있는 상태. 반면 inputRef.current.value는 현재 input값을 담고있다.
      //0.5초동안 다음 keystroke 없으면 그 때 fetch req보냄.)
      //inputRef.current.value : 현재 값을 잃어버리지 않게 useRef로 저장.
      if (enteredFilter === inputRef.current.value) {
        let url =
          "https://react-hooks-update-bbe23-default-rtdb.firebaseio.com/ingredients.json";
        if (enteredFilter.length !== 0) {
          const query = `?orderBy="title"&equalTo="${enteredFilter}"`;
          url = url + query;
        }
        sendRequest(url);
      }
    }, 500);
    return () => {
      clearTimeout(timer);
    };
    /*exhaustive-deps 룰 : 1218 TIL 참고하기*/
  }, [enteredFilter, inputRef, sendRequest]);

  useEffect(() => {
    if (!isLoading && !error && data) {
      const loadedIngredients = [];
      for (const key in data) {
        loadedIngredients.push({
          id: key,
          title: data[key].title,
          amount: data[key].amount,
        });
      }
      onLoadIngredients(loadedIngredients);
    }
  }, [data, isLoading.error, onLoadIngredients]);

  return (
    <section className="search">
      {error && <ErrorModal onClose={clear}>{error}</ErrorModal>}
      <Card>
        <div className="search-input">
          <label>Filter by Title</label>
          {isLoading && <span>Loading...</span>}
          <input
            ref={inputRef}
            type="text"
            value={enteredFilter}
            onChange={(event) => setEnteredFilter(event.target.value)}
          />
        </div>
      </Card>
    </section>
  );
});

export default Search;
