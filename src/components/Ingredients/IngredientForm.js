import React, { useState } from "react";
import LoadingIndicator from "../UI/LoadingIndicator";

import Card from "../UI/Card";
import "./IngredientForm.css";

const IngredientForm = React.memo((props) => {
  const [enteredTitle, setEnteredTitle] = useState("");
  const [enteredAmount, setEnteredAmount] = useState("");

  console.log("RENDERING INGREDIENT FORM");
  //React.memo로 감싸둔 상태라 위의 state값이 변할 때만 렌더링이 되어야 하지만,
  //IngredientForm이 loading 컴포넌트를 자식으로 가지고 있고, Ingredients에서
  //addIngredient할때마다 이 loading의 state가 바뀌기 때문에 IngredientForm도
  //render 된다.
  //또 IngredientList를 새로 그릴 때에 form도 새로 렌더링 된다.
  //=> Ingredients.js의 addIngredientHandler를 useCallback 처리
  //: Ingredients.js가 렌더링 되어도 IngredientHandler의 props로 넘어오는 add 함수가
  //old function이라는 것을 React.memo가 감지하게 되기 때문에.
  // const inputState = useState({ title: "", amount: "" });
  const submitHandler = (event) => {
    event.preventDefault();
    props.onAddIngredient({ title: enteredTitle, amount: enteredAmount });
  };

  return (
    <section className="ingredient-form">
      <Card>
        <form onSubmit={submitHandler}>
          <div className="form-control">
            <label htmlFor="title">Name</label>
            <input
              type="text"
              id="title"
              value={enteredTitle}
              onChange={(event) => {
                setEnteredTitle(event.target.value);
              }}
            />
          </div>
          <div className="form-control">
            <label htmlFor="amount">Amount</label>
            <input
              type="number"
              id="amount"
              value={enteredAmount}
              onChange={(event) => {
                setEnteredAmount(event.target.value);
              }}
            />
          </div>
          <div className="ingredient-form__actions">
            <button type="submit">Add Ingredient</button>
            {props.loading && <LoadingIndicator />}
          </div>
        </form>
      </Card>
    </section>
  );
});

export default IngredientForm;
