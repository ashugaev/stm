<template>
  <div class="slideMenu"
       :style="{ height: `calc(100% - ${paddingTop}px)`, top: paddingTop + 'px'}"
       :class="{slideMenu_active: active}">

    <!-- Фильтр столов -->
    <TablesSearch @valueChanged="changeFilter" />

    <!-- Кнопки столов -->
    <VuePerfectScrollbar class="slideMenu__slider"
                         :settings="sliderSettings">
      <TableListOne v-for="(table, index) in filteredTables"
                    :key="index"
                    :index='index'
                    :table='table' />
    </VuePerfectScrollbar>

    <!-- Добавить стол -->
    <BtnTableAdd class="slideMenu__addTable" />

  </div>
</template>

<script>
import VuePerfectScrollbar from "vue-perfect-scrollbar";
import TableListOne from "./TableButtonOne.vue";
import BtnTableAdd from "./BtnTableAdd.vue";
import TablesSearch from "./TablesSearch.vue";

export default {
  data: function() {
    return {
      //настройки для скролла
      sliderSettings: {
        suppressScrollX: true
      },
      searchText: ""
    };
  },
  props: {
    paddingTop: String,
    active: Boolean
  },
  computed: {
    // Массив со всеми задачами
    showAllTasks() {
      return this.$store.state.allTasks;
    },
    // Фильтр столов
    filteredTables() {
      return this.showAllTasks.filter(table => {
        return table.name.toLowerCase().includes(this.searchText.toLowerCase());
      });
    }
  },
  methods: {
    // Новый стол
    HeaderAdd() {
      this.$store.dispatch("addNewTable");
    },
    // Изменение значения фильтра
    changeFilter(inputData) {
      this.searchText = inputData;
    }
  },
  mounted() {
    if (window.innerWidth > 1350) {
      this.active = true;
    }
  },
  components: {
    TableListOne,
    VuePerfectScrollbar,
    BtnTableAdd,
    TablesSearch
  }
};
</script> 

<style lang="scss">
@import "../scss/helpers/_variables.scss";
@import "../scss/scrollSettings/slideTablesMenu";

.slideMenu {
  display: flex;
  flex-direction: column;
  width: 250px;
  background: white;
  position: absolute;
  transform: translateX(-100%);
  transition: transform 0.4s;
  left: 0;
  z-index: $zi-slideMenu;
  box-shadow: 0 0 13px rgba(0, 0, 0, 0.25);
  padding: 10px;
  &_active {
    transform: translateX(0);
  }
  &__addTable {
    margin-top: 15px;
  }
  &__slider {
    margin-top: 10px;
  }
}
</style>
