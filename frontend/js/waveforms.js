(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const matchId = urlParams.get('match_id');

  const isUploadPage = document.getElementById('uploadForm') !== null;
  const isCompletePage = document.querySelector('.battle-results') !== null;

  const sampleWaveform = WaveSurfer.create({
      container: '#sampleWaveform',
      waveColor: '#ccc',
      progressColor: '#4CAF50',
      height: 100,
      barWidth: 4,
      barGap: 1,
      responsive: true,
      barRadius: 0
  });


  //const originalSampleUrl = '/backend/samples/nm1.mp3'; //hardcoded sample for testing
  sampleWaveform.load('/backend/samples/nm1.mp3');

  const playSampleBtn = document.getElementById('playSampleBtn');
  if (playSampleBtn) {
      playSampleBtn.addEventListener('click', () => {
          sampleWaveform.playPause();
      });
  }

  if(isUploadPage){
    const fileInput = document.getElementById('fileInput');
    const previewWaveformContainer = document.getElementById('previewWaveform');
    const playPreviewBtn = document.getElementById('playPreviewBtn');
    let previewWaveform = null;

  if (fileInput && previewWaveformContainer && playPreviewBtn) {
      fileInput.addEventListener('change', () => {
          const selectedFile = fileInput.files[0];

          if (selectedFile) {
              const fileUrl = URL.createObjectURL(selectedFile);

              if (previewWaveform) {
                  previewWaveform.destroy();
              }

              previewWaveform = WaveSurfer.create({
                  container: '#previewWaveform',
                  waveColor: '#ccc',
                  progressColor: '#29b6f6',
                  height: 80,
                  barWidth: 4,
                  barGap: 1,
                  responsive: true,
                  barRadius: 0
              });

              previewWaveform.load(fileUrl);

              playPreviewBtn.disabled = false;
              playPreviewBtn.addEventListener('click', () => {
                  previewWaveform.playPause();
              });
          }
      });
    }
  }

  if(isCompletePage){
    console.log('Fetching match_id', matchId);
    fetch(`/backend/api/vote/get_matches.php?match_id=${matchId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const match = data.matches.find(m => m.match_id == matchId);
                    //const match = data.matches[0];
                    console.log(match)
                    if (!match) {
                        console.error('Match not found or not ready for voting');
                        return;
                    }

                    //player1_id and player2_id must be in get_matches.php to make this fully work
                    const myUserId = localStorage.getItem('logged_in_user_id');

                    const isPlayer1 = myUserId == match.player1_id;

                    const myTrackUrl = isPlayer1 ? match.player1_track : match.player2_track;
                    const opponentTrackUrl = isPlayer1 ? match.player2_track : match.player1_track;

                    const trackAWaveform = WaveSurfer.create({
                        container: '#trackAWaveform',
                        waveColor: '#ccc',
                        progressColor: '#29b6f6',
                        height: 100,
                        barWidth: 2,
                        barGap: 2,
                        responsive: true,
                        barRadius: 3
                    });
                    trackAWaveform.load(myTrackUrl);
                    document.getElementById('playTrackABtn').addEventListener('click', () => {
                        trackAWaveform.playPause();
                    });

                    const trackBWaveform = WaveSurfer.create({
                        container: '#trackBWaveform',
                        waveColor: '#ccc',
                        progressColor: '#66bb6a',
                        height: 100,
                        barWidth: 2,
                        barGap: 2,
                        responsive: true,
                        barRadius: 3
                    });
                    trackBWaveform.load(opponentTrackUrl);
                    document.getElementById('playTrackBBtn').addEventListener('click', () => {
                        trackBWaveform.playPause();
                    });

                    // Update vote counts
                    document.getElementById('trackAVotes').textContent = isPlayer1 ? match.player1_votes : match.player2_votes;
                    document.getElementById('trackBVotes').textContent = isPlayer1 ? match.player2_votes : match.player1_votes;

                    document.getElementById('totalVoters').textContent = match.player1_votes + match.player2_votes;
                    document.getElementById('battleStatus').textContent = 'Complete';
                } else {
                    console.error('Error loading matches:', data.message);
                }
            });
  }
})();
