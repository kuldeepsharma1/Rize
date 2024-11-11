import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import Parser from 'react-native-rss-parser';
import { Link, useLocalSearchParams } from 'expo-router';
import parseHTMLContent from '@/utils/parseHtml';
interface RSSEpisode {
  title: string;
  audioUrl: string;
  description: string;
  id: string;
}

export default function PodcastDetail() {
  const { url } = useLocalSearchParams(); // Get the URL parameter passed from the previous screen

  const [episodes, setEpisodes] = useState<RSSEpisode[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
 

  useEffect(() => {

    if (url) {
      fetchEpisodes(url); 
    }
  }, [url]); 
  const fetchEpisodes = async (url: string) => {
    if (!url) return;

    setLoading(true);
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch RSS');
      const rssText = await response.text();
      const feed = await Parser.parse(rssText);

      // Map the feed items into episodes with valid audio URLs
      const rssEpisodes: RSSEpisode[] = feed.items
        .map((item: any) => {
          const audioUrl = item.enclosures?.[0]?.url || null;
          return {
            title: item.title,
            description: item.description,
            audioUrl: audioUrl,
            id: item.id,
          };
        })
        .filter((episode) => episode.audioUrl !== null); // Filter episodes with audio URL

      setEpisodes(rssEpisodes);
    } catch (err) {
      console.error('Error fetching episodes:', err);
      setEpisodes([]); // Reset episodes on error
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <View style={styles.container}>
      <Text className='mt-5' style={styles.title}>Podcast Episodes</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <FlatList
          data={episodes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.episodeContainer}>
              <Text style={styles.episodeTitle}>{item.title}</Text>
              <Text style={styles.episodeDescription}>{parseHTMLContent(item.description)}</Text>
              
              <Link className='bg-green-500 py-4 rounded-full text-center text-white' href={{
              pathname: '/podcast/play/[id]',
              params: { audioUrl: item.audioUrl,title: item.title },
            }} >
              <Text>Play Episode</Text>
            </Link>
              
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  episodeContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  episodeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  episodeDescription: {
    fontSize: 14,
    marginTop: 5,
  },
  audioUrl: {
    fontSize: 12,
    marginTop: 5,
    color: 'blue',
  },
});
