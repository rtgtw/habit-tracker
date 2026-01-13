import { StyleSheet, View } from "react-native";
import { Button, SegmentedButtons, TextInput } from "react-native-paper";


const FREQUENCIES = ["daily", "weekly", "monthly"];


export default function AddHabitScreen(){


    return (<>
    <View style={styles.container}> 

          
                <TextInput label="Title" mode="outlined" style={styles.input} ></TextInput>
                <TextInput label="Description" mode="outlined" style={styles.input} theme={{ colors: { placeholder: "black", outline: "#000000" } }} ></TextInput>
            <View style={styles.frequencyContainer}>
                <SegmentedButtons 
                    style={styles.segmentedButtons}
                     buttons={FREQUENCIES.map((freq) => ({ value: freq, label: freq.charAt(0).toUpperCase() + freq.slice(1) }))} />
            </View>
        
        <Button mode="contained" style={styles.button}> Add Button</Button>


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
        marginTop: 0
    }

})


/*
-For this page we want a view
-We want an input for adding the title
-Input for the description
-Button to add the habit
-Place for us to choose the frequency, daily - weekly - monthly

<TextInputs> for inputs




*/