import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase.config';
import { useRouter } from 'expo-router';

export default function Signin() {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const router = useRouter();

    // Higher Order Functions
    const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (value: string) => {
        setter(value);
        if (errorMessage) {
            setErrorMessage(null);
        }
    };

    const handleLogin = async () => {
        setErrorMessage(null);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            if (user.emailVerified) {
                alert('Login Successful!');
                router.push('/');
            } else {
                setErrorMessage('Please verify your email before login');
            }
            setEmail('');
            setPassword('');
        } catch (error) {
            const errorMsg = (error as Error).message;
            setErrorMessage(errorMsg);
        }
    };

    return (
        <View className="flex-1 justify-center items-center bg-gray-50 px-6">
            <Text className="text-3xl font-bold text-gray-800 mb-4">Sign in</Text>
            
            <View className="w-full mb-4">
                <TextInput
                    placeholder='Email'
                    value={email}
                    onChangeText={handleInputChange(setEmail)}
                    keyboardType='email-address'
                    className="bg-white px-4 py-3 rounded-lg border border-gray-300 text-gray-900 focus:border-blue-500 focus:ring focus:ring-blue-200 transition"
                />
            </View>
            <View className="w-full mb-4">
                <TextInput
                    placeholder='Password'
                    value={password}
                    onChangeText={handleInputChange(setPassword)}
                    secureTextEntry
                    className="bg-white px-4 py-3 rounded-lg border border-gray-300 text-gray-900 focus:border-blue-500 focus:ring focus:ring-blue-200 transition"
                />
            </View>
            {errorMessage && (
                <Text className="text-red-500 mb-4 text-center">{errorMessage}</Text>
            )}
            <TouchableOpacity
                onPress={handleLogin}
                className="bg-blue-500 py-3 px-10 rounded-lg shadow-md w-full"
            >
                <Text className="text-center text-white text-lg font-semibold">Sign in</Text>
            </TouchableOpacity>
            <View className="mt-4">
                <Text className="text-gray-600">Don't have an account?{' '}
                    <Text className="text-blue-500 font-semibold" onPress={() => router.push('/sign-in')}>Sign up</Text>
                </Text>
            </View>
        </View>
    );
}
