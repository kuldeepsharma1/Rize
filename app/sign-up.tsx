import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth } from '../firebase.config';
import { useRouter } from 'expo-router';

export default function Signup() {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [emailSent, setEmailSent] = useState<boolean>(false);

    const router = useRouter();

    // Higher Order Functions
    const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (value: string) => {
        setter(value);
        if (errorMessage) {
            setErrorMessage(null);
        }
    };

    const handleSignup = async () => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await sendEmailVerification(user);
            alert('Verification email sent! Please check your inbox');
            setEmailSent(true);
            setEmail('');
            setPassword('');
        } catch (error) {
            const errorMsg = (error as Error).message;
            setErrorMessage(errorMsg);
        }
    };

    return (
        <View className="flex-1 justify-center items-center bg-gray-50 px-6">
            <Text className="text-3xl font-bold text-gray-800 mb-4">Sign up</Text>
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
            {!emailSent ? (
                <TouchableOpacity
                    onPress={handleSignup}
                    className="bg-blue-500 py-3 px-10 rounded-lg shadow-md w-full"
                >
                    <Text className="text-center text-white text-lg font-semibold">Sign up</Text>
                </TouchableOpacity>
            ) : (
                <Text className="text-green-500 mt-4 text-center">A verification email has been sent to your email address. Please verify your email before login!</Text>
            )}
            <View className="mt-4">
                <Text className="text-gray-600">Already have an account?{' '}
                    <Text className="text-blue-500 font-semibold" onPress={() => router.push('/sign-in')}>Login</Text>
                </Text>
            </View>
        </View>
    );
}
