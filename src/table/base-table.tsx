import {
  computed, defineComponent, SetupContext, h, PropType,
} from '@vue/composition-api';
import props from './base-table-props';
import useTableHeader from './hooks/useTableHeader';
import useTableBody from './hooks/useTableBody';
import useTableFooter from './hooks/useTableFooter';
import useFixed from './hooks/useFixed';
import usePagination from './hooks/usePagination';
import Loading from '../loading';
import { BaseTableProps } from './interface';
import { useTNodeJSX } from '../hooks/tnode';
import useStyle, {
  TABLE_CLASS_CONTENT,
  TABLE_CLASS_LAYOUT,
  TABLE_CLASS_COLUMN_FIXED,
  TABLE_ROOT_CLASS_HEADER_FIXED,
  TABLE_ROOT_CLASS_COLUMN_FIXED,
  TABLE_ROOT_CLASS_MULTIPLE_HEADER,
} from './hooks/useStyle';

export default defineComponent({
  name: 'TBaseTable',

  props: {
    ...props,
    /**
     * 以下属性为非公开属性，请勿在业务中使用
     */
    renderExpandedRow: Function,
    selectedRowKeys: Array as PropType<Array<string | number>>,
  },

  setup(props: BaseTableProps, context: SetupContext) {
    // 表格基础样式类
    const { tableClasses, tableContentStyles, tableElementStyles } = useStyle(props);
    // 固定表头和固定列逻辑
    const {
      tableRef,
      tableContentRef,
      isFixedHeader,
      isFixedColumn,
      showColumnShadow,
      columnStickyLeftAndRight,
      onTableContentScroll,
    } = useFixed(props);
    const {
      renderTableHeader, renderColgroup, isMultipleHeader, spansAndLeafNodes,
    } = useTableHeader(props, context);
    const { renderTableBody } = useTableBody(props, context);
    const { renderTableFooter } = useTableFooter(props, context);
    const { dataSource, isPaginateData, renderPagination } = usePagination(props, context);

    const baseTableClasses = computed(() => [
      tableClasses.value,
      { [TABLE_ROOT_CLASS_HEADER_FIXED]: isFixedHeader.value },
      { [TABLE_ROOT_CLASS_COLUMN_FIXED]: isFixedColumn.value },
      { [TABLE_ROOT_CLASS_MULTIPLE_HEADER]: isMultipleHeader.value },
      { [TABLE_CLASS_COLUMN_FIXED.leftShadow]: showColumnShadow.left },
      { [TABLE_CLASS_COLUMN_FIXED.rightShadow]: showColumnShadow.right },
    ]);

    return {
      tableRef,
      spansAndLeafNodes,
      baseTableClasses,
      tableContentStyles,
      tableElementStyles,
      renderColgroup,
      renderTableHeader,
      renderTableBody,
      renderTableFooter,
      tableContentRef,
      isFixedHeader,
      isFixedColumn,
      columnStickyLeftAndRight,
      showColumnShadow,
      onTableContentScroll,
      isPaginateData,
      dataSource,
      renderPagination,
      slots: context.slots,
    };
  },

  render() {
    const tableContent = (
      <div
        ref="tableContentRef"
        class={TABLE_CLASS_CONTENT}
        style={this.tableContentStyles}
        onScroll={this.onTableContentScroll}
      >
        <table class={TABLE_CLASS_LAYOUT[this.tableLayout]} style={this.tableElementStyles}>
          {this.renderColgroup()}
          {this.renderTableHeader({
            isFixedHeader: this.isFixedHeader,
            columnStickyLeftAndRight: this.columnStickyLeftAndRight,
          })}
          {this.renderTableBody({
            columnStickyLeftAndRight: this.columnStickyLeftAndRight,
            showColumnShadow: this.showColumnShadow,
            data: this.isPaginateData ? this.dataSource : this.data,
            columns: this.spansAndLeafNodes.leafColumns,
          })}
          {this.renderTableFooter({
            isFixedHeader: this.isFixedHeader,
            columnStickyLeftAndRight: this.columnStickyLeftAndRight,
          })}
        </table>
      </div>
    );

    const customLoadingText = useTNodeJSX('loading', { slots: this.slots });
    const loadingContent = this.loading ? (
      <Loading loading={!!this.loading} showOverlay text={() => customLoadingText} props={this.loadingProps}>
        {tableContent}
      </Loading>
    ) : (
      tableContent
    );

    return (
      <div ref="tableRef" class={this.baseTableClasses}>
        {useTNodeJSX('topContent', { slots: this.slots })}
        {loadingContent}
        {this.renderPagination(h)}
      </div>
    );
  },
});