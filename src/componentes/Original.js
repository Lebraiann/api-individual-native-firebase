import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, ScrollView, Alert } from 'react-native';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

export default function Original() {
  const [movies, setMovies] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [options, setOptions] = useState([]);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [questionCount, setQuestionCount] = useState(0);
  const [userWin, setUserWin] = useState(0);
  const [userLose, setUserLose] = useState(0);
  const [uid, setUid] = useState(null);
  const [gameFinished, setGameFinished] = useState(false);
  const [answering, setAnswering] = useState(false);
  const TOTAL_QUESTIONS = 5;

  // Escuchar login
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setUid(user.uid);
    });
    return unsubscribe;
  }, []);

  // Leer estadísticas usuario
  useEffect(() => {
    if (!uid) return;
    const traerDatos = async () => {
      const docRef = doc(db, 'usuarios', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserWin(data.ganados || 0);
        setUserLose(data.perdidos || 0);
      } else {
        await setDoc(docRef, { ganados: 0, perdidos: 0 });
        setUserWin(0);
        setUserLose(0);
      }
    };
    traerDatos();
  }, [uid]);

  // Guardar resultado en Firestore
  const guardarResultado = async (acierto) => {
    if (!uid) return;
    const fecha = new Date().toISOString();
    const resultado = {
      uid,
      pelicula: currentQuestion ? currentQuestion.title : '',
      aciertos: acierto ? 1 : 0,
      errores: acierto ? 0 : 1,
      fecha,
    };
    try {
      await setDoc(doc(db, 'resultados', `${uid}_${fecha}`), resultado);
      const docRef = doc(db, 'usuarios', uid);
      await updateDoc(docRef, {
        ganados: acierto ? userWin + 1 : userWin,
        perdidos: !acierto ? userLose + 1 : userLose,
      });
      if (acierto) setUserWin((prev) => prev + 1);
      else setUserLose((prev) => prev + 1);
    } catch (e) {
      console.error('Error al guardar resultado:', e);
    }
  };

  // Cargar películas y generar pregunta
  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const res = await fetch('https://ghibliapi.vercel.app/films/');
      const data = await res.json();
      setMovies(data);
      generateQuestion(data);
    } catch (err) {
      Alert.alert('Error', 'No se pudo obtener la información de Studio Ghibli.');
    }
  };

  const generateQuestion = (movieList) => {
    setLoading(true);
    setAnswering(false);
    const correctMovie = movieList[Math.floor(Math.random() * movieList.length)];
    const incorrectMovies = movieList
      .filter(m => m.id !== correctMovie.id)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    const allOptions = [...incorrectMovies, correctMovie].sort(() => 0.5 - Math.random());
    setCurrentQuestion(correctMovie);
    setOptions(allOptions);
    setLoading(false);
  };

  const handleAnswer = async (selected) => {
    if (answering) return;
    setAnswering(true);
    const isCorrect = selected.id === currentQuestion.id;
    if (isCorrect) {
      setScore(score + 1);
      Alert.alert('✅ ¡Correcto!', `¡Bien hecho! Era "${currentQuestion.title}"`);
    } else {
      Alert.alert('❌ Incorrecto', `La respuesta correcta era "${currentQuestion.title}"`);
    }

    // Guardar resultado en Firestore
    await guardarResultado(isCorrect);

    if (questionCount + 1 >= TOTAL_QUESTIONS) {
      setGameFinished(true);
      Alert.alert(
        '🎉 Fin del juego',
        `Tu puntuación: ${isCorrect ? score + 1 : score} / ${TOTAL_QUESTIONS}`,
      );
    } else {
      setQuestionCount(questionCount + 1);
      setTimeout(() => {
        generateQuestion(movies);
        setAnswering(false);
      }, 500);
    }
  };

  const resetGame = () => {
    setScore(0);
    setQuestionCount(0);
    setGameFinished(false);
    generateQuestion(movies);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🎥 Trivia Studio Ghibli</Text>
      <Text style={styles.stats}>Ganados: {userWin} | Perdidos: {userLose}</Text>
      <Text style={styles.score}>Puntuación: {score} / {TOTAL_QUESTIONS}</Text>

      {loading || !currentQuestion ? (
        <ActivityIndicator size="large" />
      ) : gameFinished ? (
        <TouchableOpacity style={styles.option} onPress={resetGame}>
          <Text style={styles.optionText}>Reiniciar juego</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.quizContainer}>
          <Text style={styles.question}>
            ¿A qué película pertenece esta sinopsis?
          </Text>
          <Text style={styles.description}>
            "{currentQuestion.description}"
          </Text>

          {options.map((opt, index) => (
            <TouchableOpacity
              key={index}
              style={styles.option}
              onPress={() => handleAnswer(opt)}
              disabled={answering}
            >
              <Text style={styles.optionText}>{opt.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  stats: {
    fontSize: 16,
    marginBottom: 5,
  },
  score: {
    fontSize: 18,
    marginBottom: 20,
  },
  quizContainer: {
    width: '100%',
  },
  question: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: '600',
  },
  description: {
    fontStyle: 'italic',
    marginBottom: 20,
    fontSize: 16,
  },
  option: {
    backgroundColor: '#dfe4ea',
    padding: 12,
    borderRadius: 8,
    marginVertical: 5,
  },
  optionText: {
    fontSize: 16,
  },
});