<template>
  <nuxt-layout name="default">
    <template #header>
      <el-page-header @back="$router.back()">
        <template #content>
          <span>Logs</span>
        </template>
        <template #extra>
          <el-button :icon="ElIconRefresh" :loading="loading" @click="reload()">
            Refresh
          </el-button>
        </template>
      </el-page-header>
    </template>

    <el-alert
      v-if="!isAdmin"
      title="Admins only"
      type="error"
      :closable="false"
      show-icon
    />

    <template v-else>
      <div class="flex flex-wrap justify-between gap-2 mb-4">
        <div class="flex-1 flex gap-2">
          <el-select
            v-model="filters.level"
            placeholder="Level"
            clearable
            style="width: 140px"
          >
            <el-option v-for="l in levels" :key="l" :label="l" :value="l" />
          </el-select>
          <el-input
            v-model="filters.context"
            placeholder="Context"
            clearable
            maxlength="100"
            style="width: 180px"
          />
          <el-input
            v-model="filters.search"
            placeholder="Search message"
            clearable
            maxlength="200"
            :prefix-icon="ElIconSearch"
            style="width: 240px"
          />
        </div>

        <div>
          <el-date-picker
            v-model="range"
            type="datetimerange"
            range-separator="to"
            start-placeholder="From"
            end-placeholder="To"
            class="ml-auto! w-100!"
          />
        </div>
      </div>

      <el-table
        v-loading="loading"
        :data="rows"
        row-key="id"
        height="calc(100vh - 260px)"
      >
        <el-table-column type="expand">
          <template #default="{ row }">
            <div class="p-3 space-y-3">
              <div v-if="row.stack">
                <div class="text-xs text-gray-500 mb-1">Stack</div>
                <pre
                  class="font-mono text-xs bg-gray-100 p-2 rounded overflow-auto whitespace-pre-wrap"
                  >{{ row.stack }}</pre
                >
              </div>
              <div v-if="row.meta">
                <div class="text-xs text-gray-500 mb-1">Meta</div>
                <pre
                  class="font-mono text-xs bg-gray-100 p-2 rounded overflow-auto"
                  >{{ JSON.stringify(row.meta, null, 2) }}</pre
                >
              </div>
              <div v-if="!row.stack && !row.meta" class="text-gray-400 text-sm">
                No additional details.
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="Time" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="Level" width="100">
          <template #default="{ row }">
            <el-tag :type="levelType(row.level)" size="small" effect="light">
              {{ row.level }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="context" label="Context" width="200">
          <template #default="{ row }">{{ row.context || "-" }}</template>
        </el-table-column>
        <el-table-column
          prop="message"
          label="Message"
          min-width="300"
          show-overflow-tooltip
        />
      </el-table>

      <div class="flex justify-center mt-4">
        <el-button v-if="nextCursor" :loading="loadingMore" @click="load(true)">
          Load more
        </el-button>
        <span v-else-if="!loading && rows.length" class="text-gray-400 text-sm">
          End of logs
        </span>
        <span v-else-if="!loading" class="text-gray-400 text-sm">
          No logs found
        </span>
      </div>
    </template>
  </nuxt-layout>
</template>

<script setup lang="ts">
definePageMeta({ layout: false });

interface LogRow {
  id: string;
  level: "fatal" | "error" | "warn" | "log" | "debug" | "verbose";
  context: string | null;
  message: string;
  stack: string | null;
  meta: Record<string, unknown> | null;
  createdAt: string;
}

const levels = ["fatal", "error", "warn", "log", "debug", "verbose"];

const { user } = useAuth();
const isAdmin = computed(() => !!user.value?.roles?.includes("ADMIN"));
const request = useRequest();

const filters = reactive({ level: "", context: "", search: "" });
const range = ref<[Date, Date] | null>(null);
const rows = ref<LogRow[]>([]);
const nextCursor = ref<string | null>(null);
const loading = ref(false);
const loadingMore = ref(false);
let requestSeq = 0;

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function levelType(level: string) {
  if (level === "fatal" || level === "error") return "danger";
  if (level === "warn") return "warning";
  if (level === "log") return "primary";
  return "info";
}

async function load(more = false) {
  const seq = ++requestSeq;
  if (more) loadingMore.value = true;
  else loading.value = true;

  const query: Record<string, string | number> = { limit: 50 };
  if (filters.level) query.level = filters.level;
  if (filters.context) query.context = filters.context;
  if (filters.search) query.search = filters.search;
  if (range.value) {
    query.from = range.value[0].toISOString();
    query.to = range.value[1].toISOString();
  }
  if (more && nextCursor.value) query.cursor = nextCursor.value;

  try {
    const res = await request<{ data: LogRow[]; nextCursor: string | null }>(
      "/api/logs",
      { query },
    );
    if (seq !== requestSeq) return;
    rows.value = more ? [...rows.value, ...res.data] : res.data;
    nextCursor.value = res.nextCursor;
  } catch {
    // errors are surfaced by useRequest
  } finally {
    if (seq === requestSeq) {
      loading.value = false;
      loadingMore.value = false;
    }
  }
}

function reload() {
  nextCursor.value = null;
  return load(false);
}

let timer: ReturnType<typeof setTimeout>;
watch(
  () => [filters.level, filters.context, filters.search, range.value],
  () => {
    clearTimeout(timer);
    timer = setTimeout(reload, 300);
  },
);
onBeforeUnmount(() => clearTimeout(timer));

onMounted(() => {
  if (isAdmin.value) reload();
});
</script>
