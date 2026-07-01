(function () {
  function bindTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(item => item.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.dataset.tab).classList.add('active');
      });
    });
  }

  function bindSubtabs() {
    document.querySelectorAll('.subtab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.dataset.subtab;
        const parent = btn.closest('.tab-content');
        if(!parent || !targetId) return;
        parent.querySelectorAll('.subtab-btn').forEach(item => item.classList.remove('active'));
        parent.querySelectorAll('.subtab-content').forEach(content => content.classList.remove('active'));
        btn.classList.add('active');
        const target = document.getElementById(targetId);
        if(target) target.classList.add('active');
      });
    });
  }

  function bindTheme({state, applyTheme, save}) {
    document.querySelectorAll('[data-theme-option]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.theme = btn.dataset.themeOption;
        applyTheme();
        save();
      });
    });
  }

  function bindJsonActions({state, restore, resetState, save, render}) {
    document.getElementById('exportBtn').onclick = () => {
      const blob = new Blob([JSON.stringify(state, null, 2)], {type:'application/json'});
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'copa2026-dados.json';
      link.click();
    };

    document.getElementById('importBtn').onclick = () => document.getElementById('fileIn').click();
    document.getElementById('fileIn').onchange = async event => {
      const file = event.target.files[0];
      if(!file) return;
      const text = await file.text();
      restore(JSON.parse(text));
    };

    document.getElementById('resetBtn').onclick = () => {
      if(confirm('Tem certeza que quer limpar todos os dados?')) {
        resetState();
        save({replaceRemote:true});
        render();
      }
    };
  }

  function bindSyncAction({syncNow}) {
    const button = document.getElementById('syncNowBtn');
    if(button && syncNow) button.addEventListener('click', syncNow);
  }

  async function loadSavedState({load, restore, onLoadError}) {
    try{
      const saved = await load();
      if(saved && typeof saved === 'object') restore(saved, false);
    }catch(error){
      if(onLoadError) onLoadError(error);
    }
  }

  async function init(options) {
    bindTabs();
    bindSubtabs();
    bindTheme(options);
    bindJsonActions(options);
    bindSyncAction(options);
    await loadSavedState(options);
    options.render();
  }

  window.AppController = {
    init
  };
})();
