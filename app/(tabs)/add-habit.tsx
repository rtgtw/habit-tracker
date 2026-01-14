import { DATABASE_ID, databases, HABITS_TABLE_ID } from "@/lib/appwrite";
import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { ID } from "react-native-appwrite";
import { Button, SegmentedButtons, Text, TextInput, useTheme } from "react-native-paper";
import type { ThemeProp } from "react-native-paper/lib/typescript/types";
import { useAuth } from "../../lib/auth-context";

const FREQUENCIES = ["daily", "weekly", "monthly"];

//if i index into this array with a number, what comes out?
//(typeof FREQUENCIES) === string[]
//[number] -> an element within this string array using a number will be a string
type Frequency = (typeof FREQUENCIES)[number];

export default function AddHabitScreen(){

    const [title, setTitle] = useState<string>("");
    const [description, setDescription] = useState<string>("");
    const [frequency, setFrequency] = useState<Frequency>("daily");
    const [error, setError] = useState<string>("");
    const {user} = useAuth();
    const router = useRouter();


    const handleTitle = (text:string) => {
        console.log(text);
        setTitle(text);
    }

    const handleDescription = (text:string) => {
        console.log(text);
        setDescription(text);
    }

    const handleFrequency = (value: Frequency) => {
        console.log(value);
        setFrequency(value as Frequency);
    }

    const handleSubmit = async () => {
        /*
        -Make sure the user exists before submitting this task
        */
       if(!user){return};

       //This will add to the db table
       //This will be a ROW insidde of the DB
       //Every row should have a unique ID which makes sense
       //Every new ROW should start at streak 0
       try {
         await databases.createDocument(
            DATABASE_ID,
            HABITS_TABLE_ID,
            ID.unique(),
            {
                user_id: user.$id,
                title,
                description,
                frequency,
                streak_count:0,
                last_completed: new Date().toISOString(),
                created_at: new Date().toISOString() }
        );
        
       } catch (error) {
        if(error instanceof Error){
            setError(error.message);
            return;
        }
        setError("There was an error creating the habit");
       }

        //Now that a new habit was created, we also want to see it
        router.back()
    }

    //Gotta clean this up
    const theme = useTheme();
    const themes = useTheme({
    segmentedButtons: {
        colors: {
            secondaryContainer: '#e7dff4',
            onSecondaryContainer: '#ffffff',
            surface: '#ffffff',
            onSurface: '#000000',
            outline: '#8156cd',
        }
    },
    inputs:{
         colors: { outline: "#000000" }
        },
    
    button:{
        colors: {
            //Colors for when the button is ddisabled
            surfaceDisabled: '#dedede',      // light gray background
            onSurfaceDisabled: '#777676',    // black-ish text
        },
    }
    
});

    return (<>
        <View style={styles.container}>
            <TextInput label="Title" mode="outlined"
                style={styles.input}
                theme={{ colors: { outline: "#000000" } }}
                onChangeText={handleTitle}
                textColor="black"></TextInput>

            <TextInput label="Description" mode="outlined"
                style={styles.input}
                theme={{ colors: { outline: "#000000" } }}
                onChangeText={handleDescription}
                textColor="black"></TextInput>

            <View style={styles.frequencyContainer}>
                <SegmentedButtons
                    theme={themes.segmentedButtons}
                    value={frequency}
                    onValueChange={handleFrequency}
                    style={styles.segmentedButtons}
                    buttons={FREQUENCIES.map((freq) => ({
                        value: freq, label: freq.charAt(0).toUpperCase() + freq.slice(1),
                        checkedColor: '#000000', uncheckedColor: '#000000'}))}/>
            </View>
        <Button mode="contained" 
            onPress={handleSubmit} 
            style={styles.button} 
            disabled={!title || !description} 
            buttonColor="#7256a3" 
            textColor="white" 
            theme={themes.button as ThemeProp}> Add Habit</Button>
        {error && <Text style={{color:theme.colors.error }}>{error}</Text>}
    </View>
    </>)
}


const styles = StyleSheet.create({
    container:{
        flex:1,
        padding:16,
        backgroundColor: "#f5f5f5",
        justifyContent: "center"
    },

    input:{
        marginBottom:16,
         backgroundColor: "#f5f5f5"
    },

     frequencyContainer:{
        marginBottom:24,
        
    },

    
     segmentedButtons:{
        marginBottom:0,
     
    },

    button:{
        marginTop: 0,
        marginBottom: 5
    }

})


/*
-For this page we want a view
-We want an input for adding the title
-Input for the description
-Button to add the habit
-Place for us to choose the frequency, daily - weekly - monthly
-Logic to keep track of what the user is typing (using states)

<TextInputs> for inputs




*/