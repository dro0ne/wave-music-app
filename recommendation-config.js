window.WAVE_RECOMMENDATION_CONFIG={
  historyWindow:20,
  recentTrackBlock:8,
  candidateTopK:12,
  temperature:0.16,
  mix:{
    familiar:{start:.85,end:.20},
    discovery:{start:.10,end:.55},
    experiment:{start:.05,end:.25}
  },
  weights:{preference:.25,similarity:.18,mood:.22,userNovelty:.22,releaseNovelty:.05,diversity:.08},
  penalties:{sameTrack:1.25,recentTrack:.72,sameArtist:.34,recentArtist:.16,sameAlbum:.18,genreStreak:.12,skip:.22,dislike:.75},
  moodProfiles:{
    'Спокойствие':{aliases:['peaceful','chill','calm','relaxing','easygoing','tender'],energy:.22,valence:.58,bpm:72,genres:['ambient','lo-fi','acoustic','classical','jazz','downtempo','chill']},
    'Энергия':{aliases:['energizing','fiery','empowering','upbeat','energetic'],energy:.90,valence:.72,bpm:132,genres:['dance','electronic','rock','hip-hop','workout','drum & bass']},
    'Фокус':{aliases:['focused','sophisticated','serious','focus'],energy:.38,valence:.52,bpm:88,genres:['ambient','lo-fi','classical','instrumental','piano','minimal']},
    'Мечтательно':{aliases:['dreamy','romantic','sentimental','yearning','tender'],energy:.32,valence:.62,bpm:78,genres:['dream pop','ambient','indie','shoegaze','chillwave','acoustic']},
    'Вечеринка':{aliases:['party','excited','upbeat','energizing','rowdy'],energy:.96,valence:.86,bpm:128,genres:['dance','edm','house','disco','pop','reggaeton','techno']}
  }
};
