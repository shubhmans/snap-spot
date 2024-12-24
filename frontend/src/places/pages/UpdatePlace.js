import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { useHistory } from "react-router-dom";
import { AuthContext } from "../../shared/context/auth-context";

import Input from "../../shared/components/FormElements/Input";
import {
    VALIDATOR_MINLENGTH,
    VALIDATOR_REQUIRE,
} from "../../shared/util/validators";
import Button from "../../shared/components/FormElements/Button";
import "./PlaceForm.css";
import { useForm } from "../../shared/hooks/form-hook";
import Card from "../../shared/components/UIElements/Card";
import { useHttpClient } from "../../shared/hooks/http-hook";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";

const UpdatePlace = (props) => {
    const placeId = useParams().placeId;
    const { isLoading, error, sendRequest, clearError } = useHttpClient();
    const history = useHistory();
    const auth = useContext(AuthContext);
    const [loadedPlace, setLoadedPlace] = useState();
    const [formState, inputHandler, setFormData] = useForm(
        {
            title: {
                value: "",
                isValid: false,
            },
            description: {
                value: "",
                isValid: false,
            },
        },
        false
    );

    useEffect(() => {
        const fetchPlace = async () => {
            try {
                const responseData = await sendRequest(
                    `${process.env.REACT_APP_BACKEND_URL}/api/places/${placeId}`
                );

                setLoadedPlace(responseData.place);
                setFormData(
                    {
                        title: {
                            value: responseData.place.title,
                            isValid: true,
                        },
                        description: {
                            value: responseData.place.description,
                            isValid: true,
                        },
                    },
                    true
                );
            } catch (err) {}
        };

        fetchPlace();
    }, [sendRequest, placeId, setFormData]);

    const submitHandler = async (event) => {
        event.preventDefault();
        try {
            await sendRequest(
                `${process.env.REACT_APP_BACKEND_URL}/api/places/${placeId}`,
                "PATCH",
                JSON.stringify({
                    title: formState.inputs.title.value,
                    description: formState.inputs.description.value,
                }),
                {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + auth.token,
                }
            );
            history.push("/" + auth.userId + "/places");
        } catch (err) {}
    };

    if (!loadedPlace && !error)
        return (
            <div className="center">
                <Card>
                    <h2>Could not find the place</h2>
                </Card>
            </div>
        );

    return (
        <>
            <ErrorModal error={error} onClear={clearError} />
            {isLoading && (
                <div className="center">
                    <LoadingSpinner />
                </div>
            )}
            {loadedPlace && (
                <form className="place-form" onSubmit={submitHandler}>
                    <Input
                        id="title"
                        element="input"
                        type="text"
                        label="Title"
                        validators={[VALIDATOR_REQUIRE()]}
                        errorText="Please enter valid title."
                        onInput={inputHandler}
                        initialValue={loadedPlace.title}
                        initialValid={true}
                    />
                    <Input
                        id="description"
                        element="input"
                        type="text"
                        label="Description"
                        validators={[VALIDATOR_MINLENGTH(5)]}
                        errorText="Please enter valid description."
                        onInput={inputHandler}
                        initialValue={loadedPlace.description}
                        initialValid={true}
                    />
                    <Button type="submit" disabled={!formState.isValid}>
                        UPDATE PLACE
                    </Button>
                </form>
            )}
        </>
    );
};

export default UpdatePlace;
