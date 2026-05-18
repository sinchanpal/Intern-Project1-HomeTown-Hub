import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
    name: "user",
    initialState: {

        userData: null,
        isSearchVisible: false,

    },
    reducers: {

        setUserData: (state, action) => {
            state.userData = action.payload;
        },
        //Toggles the visibility on/off
        toggleSearchBar: (state) => {
            state.isSearchVisible = !state.isSearchVisible;
        },
        //it open (useful if they click search from another page)
        setSearchVisible: (state, action) => {
            state.isSearchVisible = action.payload;
        }
    }
});

export const { setUserData, toggleSearchBar, setSearchVisible } = userSlice.actions;

export default userSlice.reducer;