import React, { useCallback, useReducer } from "react";

const formReducer = (state, action) => {
    switch (action.type) {
        case "INPUT_CHANGE":
            let isFormValid = true;
            for (const inputId in state.inputs) {
                if (!state.inputs[inputId]) {
                    continue;
                }
                if (inputId === action.inputId) {
                    isFormValid = isFormValid && action.isValid;
                } else {
                    isFormValid = isFormValid && state.inputs[inputId].isValid;
                }
            }
            return {
                ...state,
                inputs: {
                    ...state.inputs,
                    [action.inputId]: {
                        value: action.value,
                        isValid: action.isValid,
                    },
                },
                isValid: isFormValid,
            };

        case "SET_DATA":
            return {
                inputs: action.inputs,
                isValid: action.isFormValid,
            };
        default:
            return state;
    }
};

/*
If you use useForm() in your component function, it will get called for every re-evaluation 
of your component (i.e. for every re-render cycle). Hence all the logic in a custom hook 
runs every time your component function is executed.
*/
export const useForm = (initialInputs, initialFormValidity) => {
    const [formState, dispatch] = useReducer(formReducer, {
        inputs: initialInputs,
        isValid: initialFormValidity,
    });

    const inputHandler = useCallback((id, value, isValid) => {
        dispatch({
            type: "INPUT_CHANGE",
            value: value,
            isValid: isValid,
            inputId: id,
        });
    }, []);

    const setFormData = useCallback((inputData, formValidity) => {
        dispatch({
            type: "SET_DATA",
            inputs: inputData,
            isFormValid: formValidity,
        });
    }, []);
    return [formState, inputHandler, setFormData];
};
