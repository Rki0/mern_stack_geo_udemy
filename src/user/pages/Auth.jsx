import React, { useState, useContext } from "react";

import Card from "../../shared/components/UIElements/Card";
import Input from "../../shared/components/FormElements/Input";
import Button from "../../shared/components/FormElements/Button";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import ImageUpload from "../../shared/components/FormElements/ImageUpload";
import {
  VALIDATOR_EMAIL,
  VALIDATOR_MINLENGTH,
  VALIDATOR_REQUIRE,
} from "../../shared/utils/validators";
import { useHttpClient } from "../../shared/hooks/http-hook";
import { useForm } from "../../shared/hooks/form-hook";
import { AuthContext } from "../../shared/context/auth-context";
import "./Auth.css";

function Auth() {
  const auth = useContext(AuthContext);

  const [isLoginMode, seetIsLoginMode] = useState(true);

  const { isLoading, error, sendRequest, clearError } = useHttpClient();

  const [formState, inputHandler, setFormData] = useForm(
    {
      email: {
        value: "",
        isValid: false,
      },
      password: {
        value: "",
        isValid: false,
      },
    },
    false
  );

  const switchModeHandler = () => {
    if (!isLoginMode) {
      setFormData(
        {
          ...formState.inputs,
          name: undefined,
          image: undefined,
        },
        formState.inputs.email.isValid && formState.inputs.password.isValid
      );
    } else {
      setFormData(
        {
          ...formState.inputs,
          name: {
            value: "",
            isValid: false,
          },
          image: {
            value: null,
            isValid: false,
          },
        },
        false
      );
    }

    seetIsLoginMode((prevMode) => !prevMode);
  };

  const authSubmitHandler = async (e) => {
    e.preventDefault();

    // if문을 try-catch로 감싸도 되는데, 기능 구분을 위해서 따로 한 것일 뿐
    if (isLoginMode) {
      try {
        const responseData = await sendRequest(
          process.env.REACT_APP_BACKEND_URL + "/users/login",
          "POST",
          JSON.stringify({
            email: formState.inputs.email.value,
            password: formState.inputs.password.value,
          }),
          {
            "Content-Type": "application/json",
          }
        );

        auth.login(responseData.userId, responseData.token);
      } catch (err) {
        // 커스텀 훅에서 에러를 throw하기 때문에 굳이 처리하지 않아도 됨.
        // 참고로, try-catch는 then().catch()를 사용해도 되고, catch()를 사용하지 않는 것으로 굳이 처리하지 않는다는 것을 코드적으로 보여줄 수도 있다.
      }
    } else {
      try {
        // 자바스크립트에서 쓸 수 있는 모든 것은 텍스트 데이터이다. 배열, 객체, 문자열, 숫자 등등..따라서, JSON.stringify()로 처리 가능하다.
        // 그러나 이미지는 이진 데이터이다. 따라서 JSON.stringify()로 처리할 수 없다. 이 때, 사용하는 것이 FormData()이다.
        const formData = new FormData();
        formData.append("email", formState.inputs.email.value);
        formData.append("name", formState.inputs.name.value);
        formData.append("password", formState.inputs.password.value);
        // 백엔드 쪽에서 fileUpload.single('image')라고 되어있는 곳과 같은 이름으로 설정(Multer 관련 내용)
        formData.append("image", formState.inputs.image.value);

        const responseData = await sendRequest(
          process.env.REACT_APP_BACKEND_URL + "/users/signup",
          "POST",
          // formData는 fetch api가 자동으로 헤더를 추가하기 때문에 header를 굳이 써주지 않아도된다.
          formData
        );

        auth.login(responseData.userId, responseData.token);
      } catch (err) {}
    }
  };

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      <Card className="authentication">
        {isLoading && <LoadingSpinner asOverlay />}
        <h2>Login Required</h2>
        <hr />

        <form onSubmit={authSubmitHandler}>
          {!isLoginMode && (
            <Input
              element="input"
              id="name"
              type="text"
              label="Your Name"
              validators={[VALIDATOR_REQUIRE()]}
              errorText="Please enter a name."
              onInput={inputHandler}
            />
          )}

          {!isLoginMode && (
            <ImageUpload
              id="image"
              center
              onInput={inputHandler}
              errorText="Please provide an image."
            />
          )}

          <Input
            id="email"
            element="input"
            type="email"
            label="E-Mail"
            validators={[VALIDATOR_EMAIL()]}
            errorText="Please enter a valid email address."
            onInput={inputHandler}
          />

          <Input
            id="password"
            element="input"
            type="password"
            label="Password"
            validators={[VALIDATOR_MINLENGTH(6)]}
            errorText="Please enter a valid password, at least 6 characters."
            onInput={inputHandler}
          />

          <Button type="submit" disabled={!formState.isValid}>
            {isLoginMode ? "LOGIN" : "SIGNUP"}
          </Button>
        </form>

        <Button inverse onClick={switchModeHandler}>
          SWITCH TO {isLoginMode ? "SINGUP" : "LOGIN"}
        </Button>
      </Card>
    </React.Fragment>
  );
}

export default Auth;
