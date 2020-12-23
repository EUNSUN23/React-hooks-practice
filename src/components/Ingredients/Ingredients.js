import React, { useReducer, useState, useEffect, useCallback } from "react";

import IngredientForm from "./IngredientForm";
import IngredientList from "./IngredientList";
import Search from "./Search";
import ErrorModal from "../UI/ErrorModal";

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

const httpReducer = (curHttpState, action) => {
  switch (action.type) {
    case "SEND":
      //post자체를 하는게 아니라 ui 관련 state 관리 ) isLoading
      return { loading: true, error: null };
    case "RESPONSE":
      return { ...curHttpState, loading: false };
    case "ERROR":
      return { loading: false, error: action.errorMessage };
    case "CLEAR":
      return {
        ...curHttpState,
        error: null,
      };
    default:
      throw new Error("should not be reached!");
  }
};

function Ingredients() {
  //useReducer가 받는 두번째 인자는 초기 state
  useReducer(ingredientReducer, []);
  //useReducer는 요소 2개짜리 배열을 return한다. 두번째 요소는 action을 dispatch해주는 함수.(이름은 사용자지정)
  const [userIngredients, dispatch] = useReducer(ingredientReducer, []);
  const [httpState, dispatchHttp] = useReducer(httpReducer, {
    loading: false,
    error: null,
  });
  // const [userIngredients, setUserIngredients] = useState([]);

  /*위의 state들은 서로 관련성이 있음(전부 http통신 관련). 
  batching덕분에 따로 독립되어있는 state를 일괄처리할수는 있어도
  한 state가 다른 state에 의존적일때에는 이 독립적인 관리가 방해가됨.
  -> useReducer 사용. 
  */

  useEffect(() => {
    console.log("RENDERING INGREDIENTS");
  }, [userIngredients]);

  //useCallback : 컴포넌트가 render되어도 useCallback으로 감싸인 함수는 새롭게 만들어지지 않는다.
  const filterIngredientsHandler = useCallback((filteredIngredients) => {
    dispatch({ type: "SET", ingredients: filteredIngredients });
  }, []);

  const addIngredientHandler = (ingredient) => {
    dispatchHttp({ type: "SEND" });
    fetch(
      "https://react-hooks-update-bbe23-default-rtdb.firebaseio.com/ingredients.json",
      {
        method: "POST",
        body: JSON.stringify(ingredient),
        header: { "Content-Type": "application/json" },
      }
    )
      .then((response) => {
        dispatchHttp({ type: "RESPONSE" });
        return response.json(); // response 의 body를 추출해서 javascript코드로 전환한다. promise를 return한다.
      })
      .then((responseData) => {
        // setUserIngredients((prevIngredients) => [
        //   ...prevIngredients,
        //   { id: responseData.name, ...ingredient },
        //   //firebase는 데이터의 고유 id를 만들어서 name 속성에 저장한다.
        // ]);

        dispatch({
          type: "ADD",
          ingredient: { id: responseData.name, ...ingredient },
        });
      });
    //fetch는 두번째 인자 설정하지 않으면 default로 get request를 보낸다.
    //axios는 데이터 stringify, headers 설정 자동으로 해주지만 fetch는 manually 하게 써야한다.
  };

  const clearError = () => {
    dispatchHttp({ type: "CLEAR" });
  };

  const removeIngredientHandler = (ingredientId) => {
    dispatchHttp({ type: "SEND" });
    fetch(
      `https://react-hooks-update-bbe23-default-rtdb.firebaseio.com/ingredients/${ingredientId}.json`,
      {
        method: "DELETE",
      }
    )
      .then((response) => {
        dispatchHttp({ type: "RESPONSE" });
        // setUserIngredients((prevIngredients) =>
        //   prevIngredients.filter((ingredient) => ingredient.id !== ingredientId)
        // );
        dispatch({ type: "DELETE", id: ingredientId });
      })
      .catch((error) => {
        dispatchHttp({ type: "ERROR", errorMessage: "Something went wrong" });
      });
  };

  // const removeIngredientHandler = () => {};

  return (
    <div className="App">
      {httpState.error && (
        <ErrorModal onClose={clearError}>{httpState.error}</ErrorModal>
      )}
      <IngredientForm
        onAddIngredient={addIngredientHandler}
        loading={httpState.loading}
      />

      <section>
        <Search onLoadIngredients={filterIngredientsHandler} />
        <IngredientList
          ingredients={userIngredients}
          onRemoveItem={removeIngredientHandler}
        />
      </section>
    </div>
  );
}

export default Ingredients;
