import React, { useState, useEffect } from "react";
import TopBar from "./TopBar.jsx";
import { db } from "../Firebase.js";
import { collection, addDoc, doc, getDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Footer from "./Footer.jsx";
import YourQuizzes from "./Quizzes.jsx";

const Create = () => {
    const [quizTitle, setQuizTitle] = useState("");
    const [description, setDescription] = useState("");
    const [course, setCourse] = useState("");
    const [visibility, setVisibility] = useState("");
    const auth = getAuth();
    const [user, loading, error] = useAuthState(auth);
    const navigate = useNavigate();
    const [courseOptions, setCourseOptions] = useState([]);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const coursesDocRef = doc(
                    db,
                    "adminConfig",
                    "77j74B03UV8D39cP10JN"
                );
                const coursesDocSnap = await getDoc(coursesDocRef);

                if (coursesDocSnap.exists()) {
                    const data = coursesDocSnap.data();
                    setCourseOptions(data.courses || []); // Update state with courses array
                } else {
                    console.error("No such document!");
                }
            } catch (error) {
                console.error("Error fetching courses:", error);
            }
        };

        fetchCourses();
    }, []);

    const handleQuizCreation = async (e) => {
        e.preventDefault();
        if (loading) return;
        if (error) {
            console.error("Error: ", error);
            return;
        }
        if (!user) {
            console.error("No user logged in!");
            return;
        }
        const currentDate = new Date();

        try {
            // Fetch additional user details from Firestore
            const userDocRef = doc(db, "users", user.uid);
            const userDocSnap = await getDoc(userDocRef);

            let firstName = "";
            let lastName = "";
            if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                firstName = userData.firstName || "";
                lastName = userData.lastName || "";
            } else {
                console.warn("User document does not exist in Firestore!");
            }

            // Add quiz to Firestore
            const docRef = await addDoc(collection(db, "quizzes"), {
                title: quizTitle,
                description: description,
                course: course,
                visibility: visibility,
                creatorId: user.uid,
                creatorName: `${firstName} ${lastName}`.trim() || "Anonymous",
                numItems: 0,
                questions: [],
                dateCreated: currentDate.toISOString(),
                totalQuizTakers: 0,
                scoreAccumulated: 0,
            });

            console.log("Document written with ID: ", docRef.id);
            navigate(`/quiz/${docRef.id}`);
        } catch (error) {
            console.error("Error adding document: ", error);
        }
    };

    return (
        <div>
            <TopBar />
            <div className="md:flex md:justify-between">
                <YourQuizzes />
                <div className="h-screen w-full flex justify-center bg-gradient-to-br from-[#20935C] via-[#33a06a] to-[#1d7b4c] animated-background">
                    <div className="flex flex-col items-center justify-center w-5/6 mt-10">
                        <div className="w-5/6 bg-opacity-95 bg-gradient-to-b from-[#FFFFF0] via-[#F7F7E8] to-[#EFEFD0] rounded-lg shadow-xl p-8">
                            <h1 className="text-2xl font-bold mb-6">
                                Create a New Quiz
                            </h1>
                            <form
                                onSubmit={handleQuizCreation}
                                className="w-full"
                            >
                                <div className="mb-6">
                                    <label
                                        htmlFor="quizTitle"
                                        className="block text-sm font-bold"
                                    >
                                        Quiz Title
                                    </label>
                                    <input
                                        type="text"
                                        id="quizTitle"
                                        value={quizTitle}
                                        onChange={(e) =>
                                            setQuizTitle(e.target.value)
                                        }
                                        className="mt-1 p-2 py-4 w-full border rounded-md shadow-sm bg-[#FAF9F6] focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter quiz title"
                                        minLength="4"
                                        maxLength="20"
                                        required
                                    />
                                    <p className="text-xs text-gray-600 mt-1">
                                        Title should at least be 4 characters
                                        and max 20 characters.
                                    </p>
                                </div>
                                <div className="mb-6">
                                    <label
                                        htmlFor="description"
                                        className="block text-sm font-bold"
                                    >
                                        Description
                                    </label>
                                    <textarea
                                        id="description"
                                        value={description}
                                        onChange={(e) =>
                                            setDescription(e.target.value)
                                        }
                                        rows="2"
                                        className="mt-1 p-2 w-full border bg-[#FAF9F6] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                        placeholder="Describe your quiz"
                                        maxLength="100"
                                    ></textarea>
                                    <p className="text-xs text-gray-600">
                                        Optional. Max 100 characters.
                                    </p>
                                </div>
                                <div className="flex justify-between">
                                    <div className="mb-6 w-full me-2">
                                        <label
                                            htmlFor="course"
                                            className="block text-sm font-bold"
                                        >
                                            Course
                                        </label>

                                        <select
                                            id="course"
                                            value={course}
                                            onChange={(e) =>
                                                setCourse(e.target.value)
                                            }
                                            className="mt-1 p-2 py-4 w-full border bg-[#FAF9F6] rounded-md hover:cursor-pointer shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        >
                                            <option value="">
                                                Select Course
                                            </option>
                                            {courseOptions.map(
                                                (courseName, index) => (
                                                    <option
                                                        key={index}
                                                        value={courseName}
                                                    >
                                                        {courseName}
                                                    </option>
                                                )
                                            )}
                                        </select>
                                        {/* <p className="text-xs text-gray-600 mt-2">
                                            More courses will be added soon.
                                        </p> */}
                                    </div>
                                    <div className="mb-6 w-full">
                                        <label
                                            htmlFor="visibility"
                                            className="block text-sm font-bold"
                                        >
                                            Visibility
                                        </label>
                                        <select
                                            id="visibility"
                                            value={visibility}
                                            onChange={(e) =>
                                                setVisibility(e.target.value)
                                            }
                                            className="mt-1 p-2 py-4 w-full border bg-[#FAF9F6] rounded-md hover:cursor-pointer shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            required
                                        >
                                            <option value="">
                                                Select Visibility
                                            </option>
                                            <option value="Public">
                                                Public
                                            </option>
                                            <option value="Private">
                                                Private
                                            </option>
                                            <option value="Code">
                                                Accessible via Code
                                            </option>
                                        </select>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="bg-[#35A84C] hover:bg-[#33a149] transition duration-300 font-bold text-white px-6 py-2 rounded-lg shadow-lg float-right"
                                    style={{
                                        boxShadow: "0 5px 0 #2c8c3b",
                                    }}
                                >
                                    Create Quiz
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Create;
