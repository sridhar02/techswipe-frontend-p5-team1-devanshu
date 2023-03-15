import React, { useState } from "react";
import Select from "react-select";
import { useController, useForm } from "react-hook-form";
// import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
//
import RangeSlider from "react-range-slider-input";
import "react-range-slider-input/dist/style.css";
//
import {
  GeoapifyGeocoderAutocomplete,
  GeoapifyContext,
} from "@geoapify/react-geocoder-autocomplete";
import "@geoapify/geocoder-autocomplete/styles/minimal.css";
import { developerOptions, options } from "../../utils/constants";
//
import { getUserInfo, updateUserInfo, updateUserInfo2 } from "../../utils/api";
import { PartTwo } from "./PartTwo";
import { useNavigate } from "react-router-dom";

export const Settings = ({ userCoordinates }) => {
  console.log(userCoordinates);
  const navigate = useNavigate();

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: getUserInfo,
    onSuccess: (data) => {
      reset({
        name: data?.name || "",
        email: data?.email || "",
        phoneNumber: data?.phoneNumber || "",
        radius: data?.discoverySettings?.radius || "",
        bio: data?.bio | "",
      });
    },
  });

  const firstStepMutation = useMutation({
    mutationFn: updateUserInfo2,
    onSuccess: () => {
      // navigate("/dashboard");
      setStepTwo(true);
    },
  });

  const { register, handleSubmit, reset, control, watch, formState } = useForm({
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phoneNumber: user?.phoneNumber || "",
      radius: user?.discoverySettings?.radius || "",
      bio: user?.bio | "",
    },
  });

  const { field: genderField } = useController({
    name: "gender",
    control,
    defaultValue: user?.gender || "",
    rules: { required: false },
  });

  const { field: discoveryGender } = useController({
    name: "discoveryGender",
    control,
    defaultValue: user?.discoverySettings?.gender || "",

    rules: { required: false },
  });

  const { field: developerField } = useController({
    name: "role",
    control,
    defaultValue: user?.discoverySettings?.role || "All",
    rules: { required: false },
  });

  const radius = watch("radius");

  const [stepTwo, setStepTwo] = useState(false);
  const [location, setLocation] = useState({});
  const [ageRange, setAgeRange] = useState(user?.ageRange || [24, 36]);

  const onPlaceSelect = (value) => {
    setLocation({
      formattedAddress: value.properties.formatted,
      lat: value.properties.lat,
      lon: value.properties.lon,
    });
  };

  const getCoordinates = () => {
    if (user?.location?.coordinates) {
      const oldLocation = {
        lat: user?.location?.coordinates[0],
        lon: user?.location?.coordinates[1],
      };
      return `${oldLocation.lat},${oldLocation.lon}`;
    } else {
      return `${location.lat},${location.lon}`;
    }
  };

  const onSubmit = (enteredData, event) => {
    console.log("came here", enteredData);
    event.preventDefault();

    const transformedFields = {
      name: enteredData.name,
      profilePhoto:
        "https://res.cloudinary.com/dfzxo5erv/image/upload/v1677839698/generated-image-qvdrl_t83bcy.jpg",
      phoneNumber: enteredData.phoneNumber,
      email: enteredData.email || user?.email,
      place: "india",
      bio: enteredData.bio,
      birthday: enteredData.birthday || "2023-03-03",
      gender: enteredData.gender.value,
      coordinates: getCoordinates(),
      discoverySettings: {
        role: enteredData.role.value, //default value
        gender: enteredData.discoveryGender.value,
        ageRange: ageRange, // array
        radius: radius, // 100KM
      },
      // company: enteredData.company,
      // role: enteredData.role.value,
      // workExperience: `${enteredData.workExperience.value}`,
      // QuestionAnswers: questionAnswers,
      // techStack,
      // interest: interests,
    };
    firstStepMutation.mutate(transformedFields);
  };

  const handleAgeRange = (value) => {
    setAgeRange(value);
  };

  const hideLocation =
    user && user.location.coordinates.length > 0 ? true : false;

  if (!user) return null;

  return (
    <div className=" md:border-2 md:border-slate-500 my-4 md:my-10 md:rounded-md ">
      <div className="px-2 md:py-2 flex flex-col w-80 md:w-96 items-stretch">
        <img
          className="rounded-full h-30 w-20 self-center"
          src="https://res.cloudinary.com/dfzxo5erv/image/upload/v1677839698/generated-image-qvdrl_t83bcy.jpg"
          alt="Profile pic"
        />
        {!stepTwo ? (
          <>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="text-lg font-medium my-4 self-center">
                Account settings
              </div>
              <div>
                <div className="flex flex-col">
                  <label className="font-semibold">Name *</label>
                  <input
                    className="border-2 p-2 my-2"
                    placeholder="Name"
                    {...register("name", { required: false })}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="font-semibold">Email *</label>
                  <input
                    disabled={user?.email ? true : false}
                    placeholder="Email"
                    className="border-2 p-2 my-2"
                    type="email"
                    {...register("email", { required: false })}
                  />
                </div>

                <div className="flex flex-col py-2">
                  <label className="font-semibold">Gender *</label>
                  <Select
                    {...genderField}
                    placeholder="Gender"
                    //   defaultValue={selectedOption}
                    //   onChange={setSelectedOption}
                    options={options}
                  />
                </div>

                <div className="flex flex-col">
                  <label className="font-semibold">Phone Number *</label>
                  <input
                    placeholder="Phone Number"
                    className="border-2 p-2 my-2"
                    type="number"
                    {...register("phoneNumber")}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="font-semibold">Date of birth *</label>
                  <input
                    placeholder="Date of birth"
                    className="border-2 p-2 my-2"
                    type="date"
                    {...register("birthday", { required: false })}
                  />
                </div>
                <div className="flex flex-col">
                  <label className="font-semibold">Profile Info *</label>
                  <textarea
                    placeholder="Profile Info"
                    className="border-2 p-2 my-2"
                    type="text"
                    {...register("bio", { required: false })}
                  />
                </div>
                <div className="text-lg font-bold mb-4">Discovery settings</div>
                {!hideLocation && (
                  <div className="flex flex-col">
                    <label className="font-semibold">Location</label>

                    <GeoapifyContext apiKey="112eddcf23924c998ccb79ed3f2c3b6c">
                      <GeoapifyGeocoderAutocomplete
                        placeholder="Enter address here"
                        type="street"
                        limit={5}
                        value={location.formattedAddress || ""}
                        placeSelect={onPlaceSelect}
                      />
                    </GeoapifyContext>
                  </div>
                )}
                <div className="border-2 px-2 my-2">
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between">
                      <label className="font-semibold my-2">Age range {}</label>
                      <div>
                        {" "}
                        {ageRange[0]} - {ageRange[1]}{" "}
                      </div>
                    </div>
                    <div className="my-2 mb-4">
                      <RangeSlider
                        className="w-2 bg-blue-400"
                        max={100}
                        value={ageRange}
                        onInput={handleAgeRange}
                      />
                    </div>
                  </div>
                </div>
                <div className="border-2 p-2 my-4">
                  <div className="flex flex-col">
                    <div className="flex justify-between font-semibold mb-2">
                      <div>Max Distance</div>
                      <div>{radius} KM</div>
                    </div>
                    <input
                      type="range"
                      step={1000}
                      min={1000}
                      max={10000}
                      {...register("radius")}
                    />
                  </div>
                </div>
                <div className="flex flex-col mb-2">
                  <label className="font-semibold mb-2">Looking for</label>
                  <Select
                    {...discoveryGender}
                    placeholder="Looking for"
                    options={options}
                  />
                </div>
                <div className="flex flex-col mb-2">
                  <label className="font-semibold mb-2">Show me </label>
                  <Select
                    {...developerField}
                    placeholder="Show Me"
                    options={developerOptions}
                  />
                </div>
                <button
                  className="text-center py-2 bg-blue-700 w-full text-white rounded-md border-none text-xl mt-4"
                  // onClick={() => setStepTwo(true)}
                >
                  Next
                </button>
              </div>
            </form>
          </>
        ) : (
          <div>
            <PartTwo user={user} />
          </div>
        )}
      </div>
    </div>
  );
};
