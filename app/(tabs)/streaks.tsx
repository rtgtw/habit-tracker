import { account, client, DATABASE_ID, databases, HABITS_COMPLETION_ID, HABITS_TABLE_ID, RealTimeResponse } from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Query } from "react-native-appwrite";
import { ScrollView } from "react-native-gesture-handler";
import { Card, Text } from "react-native-paper";
import { Habit, HabitCompletion } from "../types/database.type";



export default function StreaksScreen(){

      const [habits, setHabits] = useState<Habit[]>([]);
      const [completedHabits, setCompletedHabits] = useState<HabitCompletion[]>([]);
      const {user} = useAuth();

      useEffect( () => {
        console.log("Entered Use Effect");
      
        if(user){
           const habitsChannel = `databases.${DATABASE_ID}.collections.${HABITS_TABLE_ID}.documents`;
          
              //Now we have to listen for real time updates/changes in the DB so we have to use
              //Appwrite's subscribe function, it subscribes to events that happen within the DB table
              //This triggers the listening, running habitSubscription(); stops the event listner
              const habitSubscription = client.subscribe(habitsChannel,
                (response:RealTimeResponse ) => {
                  
                  console.log("INSIDE HABIT SUBSCRIPTION");
                  //We are listening to real time events on this Table, the response.event is an object which tells what type of operations
                  //Account for them
                  //Create operation
                  // console.log(`Response Events:`);
                  // console.log(response.events);
                  if(response.events.includes("databases.*.collections.*.documents.*.create")){
                    console.log("Entered CREATE");
                    fetchHabits();
                  }else if(response.events.includes("databases.*.collections.*.documents.*.update")){
                      console.log("Entered UPDATE");
                    fetchHabits();
                  }else if(response.events.includes("databases.*.collections.*.documents.*.delete")){
                      console.log("Entered DELETE");
                    fetchHabits();
                  }
          
                  console.log("Exiting Subscribe!");
                }); 
          
          
                //Completions Channel
                const habitsCompletionChannel = `databases.${DATABASE_ID}.collections.${HABITS_COMPLETION_ID}.documents`;
          
              //Now we have to listen for real time updates/changes in the DB so we have to use
              //Appwrite's subscribe function, it subscribes to events that happen within the DB table
              //This triggers the listening, running habitSubscription(); stops the event listner
              const habitCompletionSubscription = client.subscribe(habitsCompletionChannel,
                (response:RealTimeResponse ) => {
                  
                  console.log("INSIDE HABIT SUBSCRIPTION");
                  //We are listening to real time events on this Table, the response.event is an object which tells what type of operations
                  //Account for them
                  //Create operation
                  // console.log(`Response Events:`);
                  // console.log(response.events);
                  if(response.events.includes("databases.*.collections.*.documents.*.create")){
                    console.log("Entered CREATE");
                    fetchCompletitons();
                  }
          
                  console.log("Exiting Subscribe!");
                }); 
   
           fetchHabits();
           fetchCompletitons();


           return () => {
            habitSubscription();
            habitCompletionSubscription();
           }
        }


      },[user]);


        //fetch the habits
        const fetchHabits = async () => {
          try {
            const sessions = account.listSessions();
      
            // console.log(DATABASE_ID);
            // console.log(HABITS_TABLE_ID);
            // console.log(user?.$id);
      
            const response = await databases.listDocuments(
              DATABASE_ID, 
              HABITS_TABLE_ID,
              //?. == return unddefined if its not there
              //?? if a isnt there, return b
              [Query.equal("user_id", user?.$id ?? "")]
              //  [Query.equal("user_id", "6965a1ae001aa9cbcfbd")]
             );
      
             //The response will have more than just the rows, .documents just returns the rows
            //  console.log("full response  \n\n");
            //  console.log(response?.documents);
            //  console.log("end response  \n\n");
         
             
             setHabits(response.documents as unknown as Habit[]);
      
          } catch (error ) {
            console.log("entered error");
            console.error(error);
          }
        }
      
        const fetchCompletitons = async () => {
      
           try {
            const sessions = account.listSessions();
      
            const response = await databases.listDocuments(
              DATABASE_ID, 
              HABITS_COMPLETION_ID,
              //?. == return unddefined if its not there
              //?? if a isnt there, return b
              [Query.equal("user_id", user?.$id ?? "")]
              //  [Query.equal("user_id", "6965a1ae001aa9cbcfbd")]
             );
      
      
             //Transformed this into an arry of just IDs
             const completions = response.documents as unknown as HabitCompletion[]
             setCompletedHabits(completions);
      
          } catch (error ) {
            console.log("entered error");
            console.error(error);
          }
        };


    interface StreakData {
        streak:number;
        bestStreak:number;
        total:number;
    }


    const getStreakData = (habitId:string): StreakData =>{

        console.log(`inside streak data with id of: ${habitId}`);
        //For each Habit, its going to return back the streak for the habit,
        //The best streak, and the total amount for it
        //Best streak and current streak

        //completed habits is all habits, habitCompletion is just this habits completions, sorted
        //For the sort method, (a,b) a-b, if its negative -> a wins, if its positive b wins, even stays the same
        const habitCompletions = completedHabits?.filter( (habit) => {return habit?.habit_id === habitId})
                                                 .sort((a,b) => new Date(a.completed_at).getTime() - new Date(b.completed_at).getTime());

 
        // console.log(`Consoling completed habits:`);
        // console.log(completedHabits);
        console.log(`habit completion length`);
        console.log(habitCompletions)

        //check if habitCompletions is empty or not
        if(habitCompletions?.length === 0){
            console.log("entered habit completion ===  0");
            return {
                streak:0,
                bestStreak:0,
                total:0
            };
        };


        //Build the streak data
        let streak = 0;
        let bestStreak = 0;
        let total = habitCompletions?.length;

        let lastDate: Date | null = null;
        let currentStreak = 0;
        
        //Loop
        //Single entry in Habit_completion
        //Meaning that every entry is the same habit but when it was completed
        habitCompletions?.forEach((completion) => {
            const date = new Date(completion.completed_at);

            if(lastDate){
                  console.log("Entered if block in get Streak Data ");
                const diff = (date.getTime() - lastDate?.getTime()) / (1000 * 60 * 60 * 24);

                if(diff <= 1.5){
                    currentStreak+= 1
                }else {
                    //initialize currentstreak to 1
                    currentStreak = 1;
                }
            }else{

                currentStreak = 1;
            };
            
                console.log("Entered else block in get Streak Data");
               
                if(currentStreak > bestStreak) bestStreak = currentStreak;
                streak = currentStreak;
                lastDate = date;

                console.log(streak);

        });


        return {streak, bestStreak, total};
    };

    const habitStreaks = habits.map((habit) => {

        console.log("consoling habits.id ");
        console.log(habit?.$id);
        // console.log(habits);

        console.log("going inside streak data");
        const {streak, bestStreak, total} = getStreakData(habit?.$id);
        console.log("info");
        console.log(bestStreak);


        // console.log("consoling getStreakDataReturn");
        // console.log({streak, bestStreak, total}); 

        return {habit,bestStreak,streak, total};
    });


    const rankedHabits = habitStreaks.sort((a,b) => b.bestStreak - a.bestStreak);

    // console.log(rankedHabits.map((habit) => habit.habit.title));

    const badgeStyle = [styles.badge1, styles.badge2, styles.badge3]

    return (<>
    
    <View style={styles.container}> 
    
    <Text style={styles.Title} variant="headlineSmall">Habit Streaks</Text>

    {rankedHabits?.length > 0 && (
        <View style={styles.rankingContainer}>
            <Text style={styles.rankingTitle}>🏅 Top Streaks</Text>
            {rankedHabits.slice(0,3).map((item,key) => (
                <View key={key} style={styles.rankingRow}> 
                    <View style={[styles.rankingBadge, badgeStyle[key]]}>
                      <Text style={styles.rankingBadgeText}>{key + 1}</Text>
                    </View>

                    <Text style={styles.rankingHabit}>{item.habit.title}</Text>
                    <Text style={styles.rankingStreak}>{item.bestStreak}</Text>
                </View>
            ))}



        </View>
    )}


    {habits.length === 0 ? 
                (<View >
                    <Text > Habits are empty! Add your first Habit</Text>
                </View>) :
          
           (
            
            <ScrollView showsVerticalScrollIndicator={false}>
            {rankedHabits.map(( {habit, streak, bestStreak, total}, key) => {return(
            <Card key={key} style={[styles.card, key === 0 && styles.firstCard]}>
                <Card.Content >
                    <Text variant="titleMedium" style={styles.habitTitle} >{habit.title}</Text>
                    <Text style={styles.habitDescription}>{habit.description}</Text>
                    <View style={styles.statsRow}>
                        <View style={styles.statBadgeFire}>
                            <Text style={styles.statBadgeText}>🔥 {streak}</Text>
                            <Text style={styles.statLabel}>Current</Text>
                        </View>

                          <View style={styles.statBadgeGold}>
                            <Text style={styles.statBadgeText}>🏆 {bestStreak}</Text>
                            <Text style={styles.statLabel}>Best</Text>
                        </View>

                          <View style={styles.statBadgeGreen }>
                            <Text style={styles.statBadgeText}>✅ {total}</Text>
                            <Text style={styles.statLabel}>Total</Text>
                        </View>
                        
                    </View>
                </Card.Content>
            </Card>
        )})}

        </ScrollView>
        
        
        ) 
        
          
          }

    </View>
    </>)
}


/*
-Get the data about the habits and the completed habits
-To have a ranking system


*/


const styles = StyleSheet.create({

    container:{
        flex:1,
        backgroundColor:"#f5f5f5",
        padding:16
    },

    Title:{
        fontWeight:"bold",
        marginBottom:16,  
        color:"black"
    },

    card:{
        marginBottom:18,
        borderRadius: 18,
        backgroundColor:"#fff",
        elevation:3,
        shadowColor: "#000",
        shadowOffset: {width:0, height:2},
        shadowOpacity: 0.08,
        shadowRadius:8,
        borderWidth:1,
        borderColor:"#f0f0f0"
    },

    firstCard:{
        borderWidth:2,
        borderColor: "#7c4dff"
    },

    habitTitle:{
        fontWeight:"bold",
        fontSize:18,
        marginBottom:2,
        color:"black"
    },

    habitDescription:{
        color:"#6c6c80",
        marginBottom: 8,
      
    },

    statsRow:{
        flexDirection:"row",
        justifyContent:"space-between",
        marginBottom:12,
        marginTop:8
    },

    statBadgeFire:{
        backgroundColor:"#fff3e0",
        borderRadius:10,
        paddingHorizontal:12,
        paddingVertical:6,
        alignItems:"center",
        minWidth:60
    },

       statBadgeGold:{
        backgroundColor:"#fffde7",
        borderRadius:10,
        paddingHorizontal:12,
        paddingVertical:6,
        alignItems:"center",
        minWidth:60
    },

       statBadgeGreen:{
        backgroundColor:"#e8f5e9",
        borderRadius:10,
        paddingHorizontal:12,
        paddingVertical:6,
        alignItems:"center",
        minWidth:60
    },

    statBadgeText:{
        fontWeight:"bold",
        fontSize:15,
        color:"#22223b"
    },

    statLabel:{
        fontSize:11,
        color:"#888",
        marginTop:2,
        fontWeight:"500"
    },

    rankingContainer:{
        marginBottom: 24,
        backgroundColor:"#fff",
        borderRadius:16,
        padding:16,
        shadowColor: "#000",
        shadowOffset:{width:0, height:2},
        shadowOpacity:0.08,
        shadowRadius:8,
        elevation:2
    },


    rankingTitle:{
        fontWeight:"bold",
        fontSize:18,
        marginBottom:12,
        color:"#7c4dff",
        letterSpacing:0.5
    },

    rankingRow:{
        flexDirection:"row",
        alignItems:"center",
        marginBottom:8,
        borderBottomWidth:1,
        borderBottomColor: "#f0f0f0",
        paddingBottom:8
    },

    rankingBadge:{
        width:28,
        height:28,
        borderRadius:14,
        alignItems:"center",
        justifyContent:"center",
        marginRight:10,
        backgroundColor:"#e0e0e0"
    },

    badge1:{
        backgroundColor:"#ffd700"
    },
    badge2:{
        backgroundColor:"#c0c0c0"
    },

    badge3:{
        backgroundColor:"#cd7f32"
    },

    rankingBadgeText:{
        fontWeight:"bold",
        color:"black",
        fontSize:15
    },

    rankingHabit:{
        flex:1,
        fontSize:15,
        color:"#333",
        fontWeight:"600"
    },

    rankingStreak:{
        fontSize:14,
        color:"#7c4dff",
        fontWeight:"bold"
    }



});

