import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GenerationHistory } from '../components/RandomGen/GenerationHistory';
import { GenerationResult } from '../components/RandomGen/GenerationResult';
import { RandomGenForm } from '../components/RandomGen/RandomGenForm';
import { KilledCaseForm, KilledCaseInput, PresetForm } from '../components/RandomGen/SavedCaseForms';
import { SavedCaseLibrary } from '../components/RandomGen/SavedCaseLibrary';
import { useAuth } from '../hooks/Auth/useAuth';
import {
  GeneratedCase,
  GenerationHistory as HistoryItem,
  GenerationHistoryPage,
  GenerationRecipe,
  GeneratorPreset,
  KilledCase,
  KilledCasePage,
  PaginationMetadata,
} from '../types/RandomGen';
import {
  deleteKilledCase,
  deleteServerHistory,
  listGeneratorPresets,
  listKilledCases,
  listServerHistory,
  postGenerateRandomCase,
  saveGeneratorPreset,
  saveKilledCase,
  saveServerHistory,
} from '../util/RandomGenApi';
import {
  deleteGenerationHistory,
  loadGenerationHistory,
  saveGenerationRecipe,
} from '../util/randomGenHistoryStorage';
import { decodeRecipeFromURL } from '../util/randomGenRecipeUrl';
import './RandomGen.css';

const SAVED_CASES_PAGE_SIZE = 10;

function emptyPagination(): PaginationMetadata {
  return { page: 1, pageSize: SAVED_CASES_PAGE_SIZE, total: 0 };
}

function messageFrom(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

export default function RandomGenPage() {
  const { user, loading: authLoading } = useAuth();
  const sharedRecipeHandled = useRef(false);
  const activeUserIDRef = useRef<string | null>(user?.id ?? null);
  const historyRequestSequence = useRef(0);
  const killedRequestSequence = useRef(0);
  const presetRequestSequence = useRef(0);
  const historyDeleteSequence = useRef(0);
  const killedDeleteSequence = useRef(0);
  const historyDeleteInFlight = useRef(0);
  const killedDeleteInFlight = useRef(0);
  activeUserIDRef.current = user?.id ?? null;
  const [result, setResult] = useState<GeneratedCase | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyOwnerID, setHistoryOwnerID] = useState<string | null>(null);
  const [historyPagination, setHistoryPagination] = useState<PaginationMetadata>(emptyPagination);
  const [killedCases, setKilledCases] = useState<KilledCase[]>([]);
  const [killedOwnerID, setKilledOwnerID] = useState<string | null>(null);
  const [killedPagination, setKilledPagination] = useState<PaginationMetadata>(emptyPagination);
  const [killedTag, setKilledTag] = useState('');
  const [presets, setPresets] = useState<GeneratorPreset[]>([]);
  const [presetsOwnerID, setPresetsOwnerID] = useState<string | null>(null);
  const [showKilledForm, setShowKilledForm] = useState(false);
  const [showPresetForm, setShowPresetForm] = useState(false);
  const [deletingHistoryId, setDeletingHistoryId] = useState('');
  const [deletingKilledId, setDeletingKilledId] = useState('');
  const [loadingKilledCases, setLoadingKilledCases] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refreshServerHistory = useCallback(async (page: number) => {
    const requestID = historyRequestSequence.current + 1;
    historyRequestSequence.current = requestID;
    const expectedUserID = activeUserIDRef.current;
    if (!expectedUserID) return false;
    let response: GenerationHistoryPage;
    try {
      response = await listServerHistory(page);
    } catch (caughtError) {
      if (historyRequestSequence.current === requestID
        && activeUserIDRef.current === expectedUserID) throw caughtError;
      return false;
    }
    if (historyRequestSequence.current !== requestID
      || activeUserIDRef.current !== expectedUserID) return false;
    const totalPages = Math.max(1, Math.ceil(response.pagination.total / response.pagination.pageSize));
    if (page > totalPages) {
      try {
        response = await listServerHistory(totalPages);
      } catch (caughtError) {
        if (historyRequestSequence.current === requestID
          && activeUserIDRef.current === expectedUserID) throw caughtError;
        return false;
      }
      if (historyRequestSequence.current !== requestID
        || activeUserIDRef.current !== expectedUserID) return false;
    }
    setHistory(response.history);
    setHistoryPagination(response.pagination);
    setHistoryOwnerID(expectedUserID);
    return true;
  }, []);

  const refreshKilledCases = useCallback(async (page: number, tag: string) => {
    const requestID = killedRequestSequence.current + 1;
    killedRequestSequence.current = requestID;
    const expectedUserID = activeUserIDRef.current;
    if (!expectedUserID) return false;
    setLoadingKilledCases(true);
    try {
      let response: KilledCasePage = await listKilledCases(page, tag);
      if (killedRequestSequence.current !== requestID
        || activeUserIDRef.current !== expectedUserID) return false;
      const totalPages = Math.max(1, Math.ceil(response.pagination.total / response.pagination.pageSize));
      if (page > totalPages) {
        response = await listKilledCases(totalPages, tag);
        if (killedRequestSequence.current !== requestID
          || activeUserIDRef.current !== expectedUserID) return false;
      }
      setKilledCases(response.killedCases);
      setKilledPagination(response.pagination);
      setKilledOwnerID(expectedUserID);
      return true;
    } catch (caughtError) {
      if (killedRequestSequence.current === requestID
        && activeUserIDRef.current === expectedUserID) throw caughtError;
      return false;
    } finally {
      if (killedRequestSequence.current === requestID
        && activeUserIDRef.current === expectedUserID) setLoadingKilledCases(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const expectedUserID = user?.id ?? null;
    historyRequestSequence.current += 1;
    killedRequestSequence.current += 1;
    presetRequestSequence.current += 1;
    const historyRequestID = historyRequestSequence.current;
    const killedRequestID = killedRequestSequence.current;
    const presetRequestID = presetRequestSequence.current;
    historyDeleteInFlight.current = 0;
    killedDeleteInFlight.current = 0;
    setDeletingHistoryId('');
    setDeletingKilledId('');
    setLoadingKilledCases(false);
    setError('');
    if (!user) {
      const guestHistory = loadGenerationHistory();
      setHistory(guestHistory);
      setHistoryOwnerID(null);
      setHistoryPagination({
        page: 1,
        pageSize: SAVED_CASES_PAGE_SIZE,
        total: guestHistory.length,
      });
      setKilledCases([]);
      setKilledOwnerID(null);
      setKilledPagination(emptyPagination());
      setKilledTag('');
      setPresets([]);
      setPresetsOwnerID(null);
      return () => {
        active = false;
      };
    }
    setHistory([]);
    setHistoryOwnerID(null);
    setHistoryPagination(emptyPagination());
    setKilledCases([]);
    setKilledOwnerID(null);
    setKilledPagination(emptyPagination());
    setKilledTag('');
    setPresets([]);
    setPresetsOwnerID(null);
    setLoadingKilledCases(true);
    void listServerHistory(1)
      .then((serverHistory) => {
        if (!active || activeUserIDRef.current !== expectedUserID
          || historyRequestSequence.current !== historyRequestID) return;
        setHistory(serverHistory.history);
        setHistoryOwnerID(expectedUserID);
        setHistoryPagination(serverHistory.pagination);
      })
      .catch((caughtError) => {
        if (active && activeUserIDRef.current === expectedUserID
          && historyRequestSequence.current === historyRequestID) {
          setError(messageFrom(caughtError, '生成履歴の取得に失敗しました'));
        }
      });
    void listKilledCases(1, '')
      .then((serverKilledCases) => {
        if (!active || activeUserIDRef.current !== expectedUserID
          || killedRequestSequence.current !== killedRequestID) return;
        setKilledCases(serverKilledCases.killedCases);
        setKilledOwnerID(expectedUserID);
        setKilledPagination(serverKilledCases.pagination);
        setKilledTag('');
      })
      .catch((caughtError) => {
        if (active && activeUserIDRef.current === expectedUserID
          && killedRequestSequence.current === killedRequestID) {
          setError(messageFrom(caughtError, '撃墜ケースの取得に失敗しました'));
        }
      })
      .finally(() => {
        if (active && activeUserIDRef.current === expectedUserID
          && killedRequestSequence.current === killedRequestID) {
          setLoadingKilledCases(false);
        }
      });
    void listGeneratorPresets()
      .then((serverPresets) => {
        if (!active || activeUserIDRef.current !== expectedUserID
          || presetRequestSequence.current !== presetRequestID) return;
        setPresets(serverPresets);
        setPresetsOwnerID(expectedUserID);
      })
      .catch((caughtError) => {
        if (active && activeUserIDRef.current === expectedUserID
          && presetRequestSequence.current === presetRequestID) {
          setError(messageFrom(caughtError, 'プリセットの取得に失敗しました'));
        }
      });
    return () => {
      active = false;
    };
  }, [user]);

  const visibleHistory = useMemo(() => {
    if (user) return historyOwnerID === user.id ? history : [];
    const start = (historyPagination.page - 1) * historyPagination.pageSize;
    return history.slice(start, start + historyPagination.pageSize);
  }, [history, historyOwnerID, historyPagination.page, historyPagination.pageSize, user]);

  const displayedHistoryPagination = user && historyOwnerID !== user.id
    ? emptyPagination()
    : historyPagination;
  const killedDataReady = Boolean(user && killedOwnerID === user.id);
  const presetsDataReady = Boolean(user && presetsOwnerID === user.id);

  const generate = useCallback(async (recipe: GenerationRecipe) => {
    const generationUserID = activeUserIDRef.current;
    setLoading(true);
    setError('');
    try {
      const generated = await postGenerateRandomCase(recipe);
      setResult(generated);
      if (generationUserID && activeUserIDRef.current === generationUserID) {
        try {
          await saveServerHistory(generated.recipe);
          await refreshServerHistory(1);
        } catch (historyError) {
          setError(`入力は生成しましたが、履歴保存に失敗しました: ${messageFrom(historyError, '不明なエラー')}`);
        }
      } else if (!generationUserID && activeUserIDRef.current === null) {
        const nextHistory = saveGenerationRecipe(generated.recipe);
        setHistory(nextHistory);
        setHistoryPagination({
          page: 1,
          pageSize: SAVED_CASES_PAGE_SIZE,
          total: nextHistory.length,
        });
      }
    } catch (caughtError) {
      setError(messageFrom(caughtError, '生成に失敗しました'));
    } finally {
      setLoading(false);
    }
  }, [refreshServerHistory]);

  const saveCurrentRecipe = () => {
    if (!result) return;
    if (user) {
      const operationUserID = activeUserIDRef.current;
      void saveServerHistory(result.recipe)
        .then(() => {
          if (activeUserIDRef.current === operationUserID) return refreshServerHistory(1);
          return false;
        })
        .catch((caughtError) => {
          if (activeUserIDRef.current === operationUserID) {
            setError(messageFrom(caughtError, '履歴保存に失敗しました'));
          }
        });
    } else {
      const nextHistory = saveGenerationRecipe(result.recipe);
      setHistory(nextHistory);
      setHistoryPagination({
        page: 1,
        pageSize: SAVED_CASES_PAGE_SIZE,
        total: nextHistory.length,
      });
    }
  };

  const handleHistoryPageChange = (page: number) => {
    if (user) {
      void refreshServerHistory(page)
        .catch((caughtError) => setError(messageFrom(caughtError, '履歴の取得に失敗しました')));
      return;
    }
    setHistoryPagination((current) => ({ ...current, page }));
  };

  const handleDeleteHistory = async (item: HistoryItem) => {
    if (historyDeleteInFlight.current !== 0) return;
    const operationID = historyDeleteSequence.current + 1;
    historyDeleteSequence.current = operationID;
    historyDeleteInFlight.current = operationID;
    const operationUserID = activeUserIDRef.current;
    setDeletingHistoryId(item.id);
    setError('');
    try {
      if (user) {
        await deleteServerHistory(item.id);
        if (activeUserIDRef.current !== operationUserID) return;
        const nextPage = history.length === 1 && historyPagination.page > 1
          ? historyPagination.page - 1
          : historyPagination.page;
        await refreshServerHistory(nextPage);
      } else {
        const nextHistory = deleteGenerationHistory(item.id);
        const totalPages = Math.max(1, Math.ceil(nextHistory.length / SAVED_CASES_PAGE_SIZE));
        setHistory(nextHistory);
        setHistoryPagination({
          page: Math.min(historyPagination.page, totalPages),
          pageSize: SAVED_CASES_PAGE_SIZE,
          total: nextHistory.length,
        });
      }
    } catch (caughtError) {
      if (activeUserIDRef.current === operationUserID) {
        setError(messageFrom(caughtError, '履歴の削除に失敗しました'));
      }
    } finally {
      if (historyDeleteInFlight.current === operationID) {
        historyDeleteInFlight.current = 0;
        if (activeUserIDRef.current === operationUserID) setDeletingHistoryId('');
      }
    }
  };

  const regenerateHistory = (item: HistoryItem) => {
    void generate(item.recipe);
  };

  useEffect(() => {
    if (authLoading || sharedRecipeHandled.current) return;
    const encodedRecipe = new URLSearchParams(window.location.search).get('recipe');
    if (!encodedRecipe) {
      sharedRecipeHandled.current = true;
      return;
    }
    sharedRecipeHandled.current = true;
    try {
      const recipe = decodeRecipeFromURL(encodedRecipe);
      if (recipe.generatorVersion !== '0.1.0') {
        setError(
          `このケースは generator v${recipe.generatorVersion} で生成されました。`
          + ' 現在のgeneratorでは完全再現できない可能性があります。',
        );
        return;
      }
      void generate(recipe);
    } catch {
      setError('共有URLのrecipeを読み取れませんでした');
    }
  }, [authLoading, generate]);

  const handleSaveKilledCase = async (input: KilledCaseInput) => {
    const operationUserID = activeUserIDRef.current;
    await saveKilledCase(input);
    if (activeUserIDRef.current !== operationUserID) return;
    setShowKilledForm(false);
    setKilledTag('');
    try {
      await refreshKilledCases(1, '');
    } catch (caughtError) {
      setError(`撃墜ケースは保存しましたが、一覧の更新に失敗しました: ${messageFrom(caughtError, '不明なエラー')}`);
    }
  };

  const handleKilledPageChange = (page: number) => {
    void refreshKilledCases(page, killedTag)
      .catch((caughtError) => setError(messageFrom(caughtError, '撃墜ケースの取得に失敗しました')));
  };

  const handleKilledTagChange = (tag: string) => {
    void refreshKilledCases(1, tag)
      .then((applied) => {
        if (applied) setKilledTag(tag);
      })
      .catch((caughtError) => setError(messageFrom(caughtError, '撃墜ケースの取得に失敗しました')));
  };

  const handleDeleteKilledCase = async (item: KilledCase) => {
    if (killedDeleteInFlight.current !== 0) return;
    const operationID = killedDeleteSequence.current + 1;
    killedDeleteSequence.current = operationID;
    killedDeleteInFlight.current = operationID;
    const operationUserID = activeUserIDRef.current;
    setDeletingKilledId(item.id);
    setError('');
    try {
      await deleteKilledCase(item.id);
      if (activeUserIDRef.current !== operationUserID) return;
      const nextPage = killedCases.length === 1 && killedPagination.page > 1
        ? killedPagination.page - 1
        : killedPagination.page;
      await refreshKilledCases(nextPage, killedTag);
    } catch (caughtError) {
      if (activeUserIDRef.current === operationUserID) {
        setError(messageFrom(caughtError, '撃墜ケースの削除に失敗しました'));
      }
    } finally {
      if (killedDeleteInFlight.current === operationID) {
        killedDeleteInFlight.current = 0;
        if (activeUserIDRef.current === operationUserID) setDeletingKilledId('');
      }
    }
  };

  const handleSavePreset = async (name: string, recipe: GenerationRecipe) => {
    const operationUserID = activeUserIDRef.current;
    const requestID = presetRequestSequence.current + 1;
    presetRequestSequence.current = requestID;
    const saved = await saveGeneratorPreset(name, recipe);
    if (activeUserIDRef.current !== operationUserID
      || presetRequestSequence.current !== requestID) return;
    setPresets((current) => [saved, ...current]);
    setPresetsOwnerID(operationUserID);
    setShowPresetForm(false);
  };

  return (
    <main className="random-gen-page">
      <header>
        <span className="random-gen-badge">Random Gen</span>
        <h1>競技プログラミング入力生成</h1>
        <p>seedから再現可能な配列・木・グラフの特殊ケースを生成します。</p>
      </header>
      <RandomGenForm loading={loading} onGenerate={(recipe) => void generate(recipe)} />
      {error && <p className="random-gen-page-error" role="alert">エラー: {error}</p>}
      {result && (
        <GenerationResult
          result={result}
          loading={loading}
          authenticated={Boolean(user)}
          onRegenerate={() => void generate(result.recipe)}
          onSaveRecipe={saveCurrentRecipe}
          onMarkKilled={() => setShowKilledForm(true)}
          onSavePreset={() => setShowPresetForm(true)}
        />
      )}
      {result && user && showKilledForm && (
        <KilledCaseForm
          recipe={result.recipe}
          onSubmit={handleSaveKilledCase}
          onCancel={() => setShowKilledForm(false)}
        />
      )}
      {result && user && showPresetForm && (
        <PresetForm
          recipe={result.recipe}
          onSubmit={handleSavePreset}
          onCancel={() => setShowPresetForm(false)}
        />
      )}
      <GenerationHistory
        history={visibleHistory}
        pagination={displayedHistoryPagination}
        onRegenerate={regenerateHistory}
        onDelete={(item) => void handleDeleteHistory(item)}
        onPageChange={handleHistoryPageChange}
        deletingId={deletingHistoryId}
      />
      {user && (
        <SavedCaseLibrary
          killedCases={killedDataReady ? killedCases : []}
          presets={presetsDataReady ? presets : []}
          killedPagination={killedDataReady ? killedPagination : emptyPagination()}
          killedTag={killedTag}
          onKilledPageChange={handleKilledPageChange}
          onKilledTagChange={handleKilledTagChange}
          onDeleteKilled={(item) => void handleDeleteKilledCase(item)}
          deletingKilledId={deletingKilledId}
          loadingKilledCases={loadingKilledCases}
          onRegenerateKilled={(item) => void generate(item.recipe)}
          onRegeneratePreset={(item) => void generate(item.recipe)}
        />
      )}
    </main>
  );
}
