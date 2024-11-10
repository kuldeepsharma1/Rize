import React, { useEffect, useState } from 'react';
import { View, TextInput, Text, useColorScheme, FlatList, StyleSheet, Modal, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TabProfileIcon } from "@/components/navigation/TabBarIcon";
import { Link } from 'expo-router';
import TimeBlock from '@/components/TimeBlock';
// import { requestPermissions, scheduleNotification } from '@/utils/Notification';



interface Task {
  id: number;
  content: string;
  time: string;
}
const TASKS_KEY = "dailyTasks";
const HomeScreen = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [latestTasks, setLatestTasks] = useState<Task[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editedContent, setEditedContent] = useState("");
  const colorScheme = useColorScheme();

  useEffect(() => {
    const fetchLatestTasks = async () => {
      try {
        const tasksJson = await AsyncStorage.getItem('dailyTasks');
        if (tasksJson) {
          const tasks: Task[] = JSON.parse(tasksJson);

          const currentHour = new Date().getHours();
          const previousHour = (currentHour - 1 + 24) % 24;
          const nextHour = (currentHour + 1) % 24;

          const filteredTasks = tasks.filter(task => {
            const taskHour = parseInt(task.time, 10);
            return taskHour === previousHour || taskHour === currentHour || taskHour === nextHour;
          });
          setTasks(tasks);
          setLatestTasks(filteredTasks);
        } else {
          setLatestTasks([
            { id: 1, content: "... .... .... ....", time: "00" },
            { id: 2, content: "... .... .... ....", time: "01" },
            { id: 3, content: "... .... .... ....", time: "02" },
          ]);
        }
      } catch (error) {
        console.error('Error fetching latest tasks:', error);
      }
    };

    fetchLatestTasks();
  }, [latestTasks]);

  // notification
  // useEffect(() => {
  //   (async () => {
  //     const status = await requestPermissions();
  //     if (status !== 'granted') {
  //       Alert.alert('Permission to receive notifications was denied.');
  //     }
  //   })();
  // }, []);

  const openModal = (task: Task) => {
    setSelectedTask(task);
    setEditedContent(task.content);
    setModalVisible(true);
  };
  const saveEditedTask = async () => {
    if (selectedTask) {
      const updatedTasks = tasks.map(task =>
        task.id === selectedTask.id ? { ...task, content: editedContent } : task
      );
      setTasks(updatedTasks);
      setLatestTasks(updatedTasks.filter(task => {
        const taskHour = parseInt(task.time, 10);
        const currentHour = new Date().getHours();
        const previousHour = (currentHour - 1 + 24) % 24;
        const nextHour = (currentHour + 1) % 24;
        return taskHour === previousHour || taskHour === currentHour || taskHour === nextHour;
      }));
      await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(updatedTasks));
      setModalVisible(false);
    }
  };
  const now: Date = new Date();
  const currentHour: number = now.getHours();
  const currentHourString: string = now.getHours().toString().padStart(2, '0');
  const prevHour: string = ((currentHour - 1 + 24) % 24).toString().padStart(2, '0');
  const nextHour: string = ((currentHour + 1) % 24).toString().padStart(2, '0');
  function convertHourTo12HourFormat(hourStr: string): string {
    const hour = parseInt(hourStr, 10); // Convert the hour string to a number
    const period = hour >= 12 ? 'PM' : 'AM';
    const twelveHour = hour % 12 || 12; // Convert '0' to '12'
    return `${twelveHour} ${period}`;
  }
  return (

    <View className='grid grid-cols-1 md:grid-cols-2  '>
      <View className='h-[75vh] sm:h-screen md:pb-20 '>
        <Text className='text-2xl sm:text-4xl pt-12 pb-4 text-center dark:text-neutral-100'>Manage Tasks</Text>
        <FlatList
          data={latestTasks}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={true}
          renderItem={({ item }) => (
            <View
              className={`bg-white border border-t-4  ${item.time === currentHourString
                ? "border-t-green-600 dark:border-t-green-500"
                : " "}
                ${item.time == nextHour
                  ? "border-t-red-600 dark:border-t-red-500"
                  : " "}  ${item.time == prevHour
                    ? "border-t-yellow-600 dark:border-t-yellow-500"
                    : " "}
            shadow-sm rounded-[32px] dark:bg-neutral-900   dark:shadow-neutral-700/70
            mb-5 px-4 py-4 mx-4`}
            >

              <View className="flex flex-row justify-between ">
                <Text className="text-xs sm:text-sm text-gray-800 dark:text-white">
                  {convertHourTo12HourFormat(item.time)}
                </Text>
                {item.time == currentHourString && (
                  <Pressable onPress={() => openModal(item)} >
                    <TabProfileIcon name="edit" className="dark:text-white" />
                  </Pressable>
                )}
                {item.time == nextHour && (
                  <Pressable onPress={() => openModal(item)}>
                    <TabProfileIcon name="edit" className="dark:text-white" />
                  </Pressable>
                )}
              </View>
              <View className="p-2 md:p-5 ">
                <Text className="text-base font-semibold text-gray-800 dark:text-white">
                  {item.content}
                </Text>

              </View>
              <View className='pr-8'>
                <TimeBlock item={item} currentHourString={currentHourString} />
              </View>
            </View>
          )}
        />

        <View>
          {selectedTask &&
            <Modal
              visible={modalVisible}
              animationType="slide"
              onRequestClose={() => setModalVisible(false)}
            >
              <View
                style={
                  colorScheme === "dark"
                    ? stylesDark.modalContainer
                    : styles.modalContainer
                }
              >
                <Text
                  style={
                    colorScheme === "dark"
                      ? stylesDark.modalTitle
                      : styles.modalTitle
                  }
                >
                  Edit Task
                </Text>
                <TextInput
                  style={
                    colorScheme === "dark"
                      ? stylesDark.modalInput
                      : styles.modalInput
                  }
                  maxLength={200}
                  multiline
                  className="text-xl"
                  numberOfLines={3}
                  value={editedContent}
                  onChangeText={setEditedContent}
                />
                <Pressable
                  className='rounded-full'
                  style={
                    colorScheme === "dark"
                      ? stylesDark.modalButton
                      : styles.modalButton
                  }
                  onPress={saveEditedTask}
                >
                  <Text
                    className="text-lg font-medium dark:text-white"
                    style={
                      colorScheme === "dark"
                        ? stylesDark.modalButtonText
                        : styles.modalButtonText
                    }
                  >
                    Save
                  </Text>
                </Pressable>
                <Pressable
                  className="mx-auto mt-4 "
                  onPress={() => setModalVisible(false)}
                ><Text className="text-xl p-2 font-medium dark:text-white">Cancel</Text>

                </Pressable>

              </View>
            </Modal>}
        </View>
      </View>
      <View>

      </View>
    </View>

  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#000',
  },
  templateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  hour: {
    width: 50,
    fontSize: 16,
    color: '#000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 5,
    flex: 1,
    borderRadius: 5,
    color: '#000',
  },
  button: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#007bff',

    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#fff"
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginBottom: 20
  },
  modalButton: {
    backgroundColor: "#0aaf1d",
    padding: 10,

    alignItems: "center",
    marginBottom: 10,
    width: 120,
    marginHorizontal: 'auto'
  },
  modalButtonText: {
    color: "#fff"
  }
});



const stylesDark = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#000"
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#fff"
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#444",
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
    color: "#fff"
  },
  modalButton: {
    backgroundColor: "#0aaf1d",
    padding: 10,

    alignItems: "center",
    marginBottom: 10,
    width: 120,
    marginHorizontal: 'auto'
  },
  modalButtonText: {
    color: "#fff"
  }
});




export default HomeScreen;
