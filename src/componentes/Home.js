import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, Image, ActivityIndicator } from 'react-native';

export default function Home() {
  const [data, setData] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const obtenerDatos = async () => {
      try {
        const res = await fetch("https://ghibliapi.vercel.app/films/");
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error('Error al obtener datos:', error);
      } finally {
        setCargando(false);
      }
    };

    obtenerDatos();
  }, []);

  if (cargando) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Cargando películas...</Text>
      </View>
    );
  }

  return (
    <ScrollView>
      <View style={styles.lista}>
        {data.map((film) => (
          <View key={film.id} style={styles.item}>
            <Text style={{ fontWeight: 'bold' }}>{film.title}</Text>
            <Text>Director: {film.director}</Text>
            {film.image ? (
              <Image
                source={{ uri: film.image }}
                style={styles.imagen}
              />
            ) : (
              <Text>Sin imagen</Text>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  lista: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    justifyContent: 'space-between',
    padding: 10,
  },
  item: {
    backgroundColor: 'aliceblue',
    width: '48%',
    padding: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  imagen: {
    width: 100,
    height: 150,
    resizeMode: 'contain',
  },
});