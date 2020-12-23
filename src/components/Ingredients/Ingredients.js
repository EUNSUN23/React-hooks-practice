import React, { useReducer, useEffect, useCallback, useMemo } from "react";

import IngredientForm from "./IngredientForm";
import IngredientList from "./IngredientList";
import Search from "./Search";
import ErrorModal from "../UI/ErrorModal";
import useHttp from "../../hooks/http";

const ingredientReducer = (currentIngredients, action) => {
  switch (action.type) {
    case "SET":
      return action.ingredients;
    case "ADD":
      return [...currentIngredients, action.ingredient];
    case "DELETE":
      return currentIngredients.filter((ing) => ing.id !== action.id);

    default:
      throw new Error("Should not get there!");
  }
};

function Ingredients() {
  //useReducer가 받는 두번째 인자는 초기 state
  useReducer(ingredientReducer, []);
  //useReducer는 요소 2개짜리 배열을 return한다. 두번째 요소는 action을 dispatch해주는 함수.(이름은 사용자지정)
  const [userIngredients, dispatch] = useReducer(ingredientReducer, []);
  const {
    isLoading,
    error,
    data,
    sendRequest,
    reqExtra,
    reqIdentifier,
    clear,
  } = useHttp(); // 여기서 useHttp는 http통신을 직접 하는것이 아니라 통신을 위한 logic을 세팅함.

  // const [userIngredients, setUserIngredients] = useState([]);

  /*위의 state들은 서로 관련성이 있음(전부 http통신 관련). 
  batching덕분에 따로 독립되어있는 state를 일괄처리할수는 있어도
  한 state가 다른 state에 의존적일때에는 이 독립적인 관리가 방해가됨.
  -> useReducer 사용. 
  */

  useEffect(() => {
    if (!isLoading && !error && reqIdentifier === "REMOVE_INGREDIENT") {
      dispatch({ type: "DELETE", id: reqExtra });
    } else if (!isLoading && !error && reqIdentifier === "ADD_INGREDIENT") {
      dispatch({
        type: "ADD",
        ingredient: {
          id: data.name,
          ...reqExtra,
        },
      });
    }
  }, [data, reqExtra, reqIdentifier, isLoading, error]);

  //useCallback : 컴포넌트가 render되어도 useCallback으로 감싸인 함수는 새롭게 만들어지지 않는다.
  const filterIngredientsHandler = useCallback((filteredIngredients) => {
    dispatch({ type: "SET", ingredients: filteredIngredients });
  }, []);

  const addIngredientHandler = useCallback(
    (ingredient) => {
      sendRequest(
        "https://react-hooks-update-bbe23-default-rtdb.firebaseio.com/ingredients.json",
        "POST",
        JSON.stringify(ingredient),
        ingredient,
        "ADD_INGREDIENT"
      );
      // dispatchHttp({ type: "SEND" });
      // fetch(
      //   "https://react-hooks-update-bbe23-default-rtdb.firebaseio.com/ingredients.json",
      //   {
      //     method: "POST",
      //     body: JSON.stringify(ingredient),
      //     header: { "Content-Type": "application/json" },
      //   }
      // )
      //   .then((response) => {
      //     dispatchHttp({ type: "RESPONSE" });
      //     return response.json(); // response 의 body를 추출해서 javascript코드로 전환한다. promise를 return한다.
      //   })
      //   .then((responseData) => {
      //     // setUserIngredients((prevIngredients) => [
      //     //   ...prevIngredients,
      //     //   { id: responseData.name, ...ingredient },
      //     //   //firebase는 데이터의 고유 id를 만들어서 name 속성에 저장한다.
      //     // ]);

      //     dispatch({
      //       type: "ADD",
      //       ingredient: { id: responseData.name, ...ingredient },
      //     });
      //   });
      // //fetch는 두번째 인자 설정하지 않으면 default로 get request를 보낸다.
      // //axios는 데이터 stringify, headers 설정 자동으로 해주지만 fetch는 manually 하게 써야한다.
    },
    [sendRequest]
  );

  const removeIngredientHandler = useCallback(
    (ingredientId) => {
      sendRequest(
        `https://react-hooks-update-bbe23-default-rtdb.firebaseio.com/ingredients/${ingredientId}.json`,
        "DELETE",
        null,
        ingredientId,
        "REMOVE_INGREDIENT"
      );
      //useHttp에서 sendRequest를 useCallback으로 묶어놨기 때문에 sendRequest는 Ingredients.js가 렌더링
      //되어도 변하지 않고, 따라서 dependency로 넣어도 이에 따라서 removeIngredientHandler가 생성될 일은 없음.
    },
    [sendRequest]
  );

  const ingredientList = useMemo(() => {
    //useMemo : 특정 value를 return하는 무기명함수를 인자로 받는다. (특정 조건에서만 이 함수 실행해서
    //새롭게 update된 value를 return한다. )
    return (
      <IngredientList
        ingredients={userIngredients}
        onRemoveItem={removeIngredientHandler}
      />
    );
  }, [userIngredients, removeIngredientHandler]);

  // const removeIngredientHandler = () => {};

  return (
    <div className="App">
      {error && <ErrorModal onClose={clear}>{error}</ErrorModal>}
      <IngredientForm
        onAddIngredient={addIngredientHandler}
        loading={isLoading}
      />

      <section>
        <Search onLoadIngredients={filterIngredientsHandler} />
        {ingredientList}
      </section>
    </div>
  );
}

export default Ingredients;
