import React, { useContext } from "react";
import { useHistory } from "react-router-dom";

import "./PlaceForm.css";
import Input from "../../shared/components/FormElements/Input";
import {
    VALIDATOR_MINLENGTH,
    VALIDATOR_REQUIRE,
} from "../../shared/util/validators";
import Button from "../../shared/components/FormElements/Button";
import { useForm } from "../../shared/hooks/form-hook";
import { useHttpClient } from "../../shared/hooks/http-hook";
import { AuthContext } from "../../shared/context/auth-context";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import ImageUpload from "../../shared/components/FormElements/ImageUpload";

const NewPlace = () => {
    const { isLoading, error, sendRequest, clearError } = useHttpClient();
    const auth = useContext(AuthContext);
    // Here it should match with id
    const [formState, inputHandler] = useForm(
        {
            title: {
                value: "",
                isValid: false,
            },
            description: {
                value: "",
                isValid: false,
            },
            address: {
                value: "",
                isValid: false,
            },
            image: {
                value: "",
                isValid: false,
            },
        },
        false
    );
    const history = useHistory();

    const placeSubmitHandler = async (event) => {
        event.preventDefault();
        const location = {
            lat: 18.5204,
            lng: 73.8567,
        };
        const formData = new FormData();
        formData.append("title", formState.inputs.title.value);
        formData.append("description", formState.inputs.description.value);
        formData.append("address", formState.inputs.address.value);
        formData.append("location[lat]", location.lat);
        formData.append("location[lng]", location.lng);
        formData.append("imageUrl", formState.inputs.image.value);

        try {
            await sendRequest(
                process.env.REACT_APP_BACKEND_URL + "/api/places",
                "POST",
                formData,
                {
                    Authorization: "Bearer " + auth.token,
                }
            );
            history.push("/");
        } catch (err) {}
    };

    return (
        <>
            <ErrorModal error={error} onClear={clearError} />
            <form className="place-form" onSubmit={placeSubmitHandler}>
                {isLoading && <LoadingSpinner asOverlay />}
                <Input
                    id="title"
                    type="text"
                    label="Title"
                    element="input"
                    errorText="Please enter a valid title"
                    validators={[VALIDATOR_REQUIRE()]}
                    onInput={inputHandler}
                />
                <Input
                    id="description"
                    label="Description"
                    element="textarea"
                    errorText="Please enter a valid description"
                    validators={[VALIDATOR_MINLENGTH(5)]}
                    onInput={inputHandler}
                />
                <Input
                    id="address"
                    label="Address"
                    element="input"
                    errorText="Please enter a valid address"
                    validators={[VALIDATOR_REQUIRE(5)]}
                    onInput={inputHandler}
                />
                <ImageUpload
                    id="image"
                    onInput={inputHandler}
                    errorText={"Please upload the image"}
                />
                <Button type="submit" disabled={!formState.isValid}>
                    ADD PLACE
                </Button>
            </form>
        </>
    );
};

export default NewPlace;
