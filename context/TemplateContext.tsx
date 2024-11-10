import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";

interface TemplateItem {
  id: number;
  content: string;
  time: string;
}

interface Template {
  id: number;
  title: string;
  desc: string;
  public: boolean;
  items: TemplateItem[];
}

interface TemplateContextProps {
  loading:boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  templates: Template[];
  dailyTasks: TemplateItem[];
  activeTemplateId: number | null;
  addTemplateToDailyTasks: (template: Template) => void;
  setTemplates: React.Dispatch<React.SetStateAction<Template[]>>;
}

const TemplateContext = createContext<TemplateContextProps | undefined>(undefined);

const STORAGE_KEY = "Templates";
const TASKS_KEY = "dailyTasks";
const TASKS_KEY_ID = "dailyTasksid";

export const TemplateProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [dailyTasks, setDailyTasks] = useState<TemplateItem[]>([]);
  const [activeTemplateId, setActiveTemplateId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const storedTemplates = await AsyncStorage.getItem(STORAGE_KEY);
        const storedDailyTasksId = await AsyncStorage.getItem(TASKS_KEY_ID);
       
        if (storedTemplates) {
          setTemplates(JSON.parse(storedTemplates));
        }
        if (storedDailyTasksId) {
          setActiveTemplateId(Number(storedDailyTasksId));
        }
      } catch (error) {
        console.error("Failed to load templates from local storage", error);
        Alert.alert("Error", "Failed to load templates");
      }
    };
    loadTemplates();
  }, []);

  const addTemplateToDailyTasks = async (template: Template) => {
    // Validate the template structure
    setLoading(true);
    if (!template || !template.items || !template.id) {
      Alert.alert("Error", "Invalid template data.");
      return;
    }
  
    // Update local state before async operations to avoid race conditions
    setDailyTasks(template.items);
    setActiveTemplateId(template.id);
  
    try {
      // Store daily tasks and active template ID in AsyncStorage
      await Promise.all([
        AsyncStorage.setItem(TASKS_KEY, JSON.stringify(template.items)),
        AsyncStorage.setItem(TASKS_KEY_ID, JSON.stringify(template.id)),
      ]);
  
      // Confirm the operation to the user
      Alert.alert("Success", "Template added to daily tasks successfully");
    } catch (error) {
      // Improved error handling
      console.error("Failed to save daily tasks to local storage", error);
      Alert.alert("Error", "Failed to save daily tasks to local storage. Please try again.");
    } finally {
      setLoading(false);
  }
  };
  

  return (
    <TemplateContext.Provider
      value={{loading,setLoading, templates, dailyTasks, activeTemplateId, addTemplateToDailyTasks, setTemplates }}
    >
      {children}
    </TemplateContext.Provider>
  );
};

export const useTemplateContext = () => {
  const context = useContext(TemplateContext);
  if (context === undefined) {
    throw new Error("useTemplateContext must be used within a TemplateProvider");
  }
  return context;
};
