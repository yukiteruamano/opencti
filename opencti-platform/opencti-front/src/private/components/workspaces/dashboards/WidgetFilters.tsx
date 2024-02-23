import Filters from '@components/common/lists/Filters';
import React, { FunctionComponent, useEffect } from 'react';
import { Box } from '@mui/material';
import { uniq } from 'ramda';
import useFiltersState from '../../../../utils/filters/useFiltersState';
import { FilterGroup, isFilterGroupNotEmpty, useBuildFilterKeysMapFromEntityType } from '../../../../utils/filters/filtersUtils';
import FilterIconButton from '../../../../components/FilterIconButton';
import { useFormatter } from '../../../../components/i18n';

interface DataSelection {
  label: string;
  attribute: string;
  date_attribute: string;
  perspective: string;
  filters: FilterGroup,
  dynamicFrom: FilterGroup,
  dynamicTo: FilterGroup,
}

interface WidgetFiltersProps {
  perspective: string;
  type: string;
  dataSelection: DataSelection;
  setDataSelection: (data: DataSelection) => void;
}

const WidgetFilters: FunctionComponent<WidgetFiltersProps> = ({ perspective, type, dataSelection, setDataSelection }) => {
  const { t_i18n } = useFormatter();
  const [filters, helpers] = useFiltersState(dataSelection.filters);
  const [filtersDynamicFrom, helpersDynamicFrom] = useFiltersState(dataSelection.dynamicFrom);
  const [filtersDynamicTo, helpersDynamicTo] = useFiltersState(dataSelection.dynamicTo);

  useEffect(() => {
    setDataSelection({
      ...dataSelection,
      filters,
      dynamicTo: filtersDynamicTo,
      dynamicFrom: filtersDynamicFrom,
    });
  }, [filters, filtersDynamicFrom, filtersDynamicTo]);

  let availableEntityTypes = [
    'Stix-Domain-Object',
    'Stix-Cyber-Observable',
  ];
  let searchContext = { entityTypes: ['Stix-Core-Object'] };
  if (perspective === 'relationships') {
    availableEntityTypes = [
      'Stix-Domain-Object',
      'Stix-Cyber-Observable',
    ];
    searchContext = { entityTypes: ['stix-core-relationship'] };
  } else if (perspective === 'audits') {
    availableEntityTypes = ['History', 'Activity'];
    searchContext = { entityTypes: ['History'] };
  }
  const filterKeysMap = useBuildFilterKeysMapFromEntityType(searchContext.entityTypes);
  const availableFilterKeys = uniq(Array.from(filterKeysMap.keys() ?? [])).concat('entity_type');
  const entitiesFilterKeysMap = useBuildFilterKeysMapFromEntityType(['Stix-Core-Object']);
  const entitiesFilters = uniq(Array.from(entitiesFilterKeysMap.keys() ?? []));
  return <><Box sx={{ display: 'flex', justifyContent: 'space-between', paddingTop: 2 }}>
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Filters
        availableFilterKeys={type === 'bookmark' ? ['entity_type'] : availableFilterKeys}
        availableEntityTypes={availableEntityTypes}
        helpers={helpers}
        searchContext={type === 'bookmark' ? undefined : searchContext}
      />
    </Box>
    { perspective === 'relationships' && (
    <>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Filters
          availableFilterKeys={entitiesFilters}
          availableEntityTypes={[
            'Stix-Domain-Object',
            'Stix-Cyber-Observable',
          ]}
          helpers={helpersDynamicFrom}
          type="from"
          searchContext={{ entityTypes: ['Stix-Core-Object'] }}
        />
      </Box>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Filters
          availableFilterKeys={entitiesFilters}
          availableEntityTypes={[
            'Stix-Domain-Object',
            'Stix-Cyber-Observable',
          ]}
          helpers={helpersDynamicTo}
          type="to"
          searchContext={{ entityTypes: ['Stix-Core-Object'] }}
        />
      </Box>
    </>)}
  </Box>
    <Box sx={{ paddingTop: 1 }}>
      { isFilterGroupNotEmpty(filtersDynamicFrom) && (
        <>
          <div style={{
            marginTop: 8,
            color: 'orange',
          }}
          >{t_i18n('Pre-query to get data to be used as source entity of the relationship (limited to 5000)')}</div>
          <FilterIconButton
            filters={filtersDynamicFrom}
            helpers={helpersDynamicFrom}
            chipColor={'warning'}
            entityTypes={['Stix-Core-Object']}
          />
        </>
      )}
      { isFilterGroupNotEmpty(filtersDynamicTo) && (
        <>
          <div style={{
            marginTop: 8,
            color: '#03A847',
          }}
          >{t_i18n('Pre-query to get data to be used as target entity of the relationship (limited to 5000)')}</div>
          <FilterIconButton
            filters={filtersDynamicTo}
            helpers={helpersDynamicTo}
            chipColor={'success'}
            entityTypes={['Stix-Core-Object']}
          />
        </>
      )}

      { isFilterGroupNotEmpty(filters) && (
        <>
          { perspective === 'relationships'
            && <div style={{ marginTop: 8 }}>{t_i18n('Result: the relationships with source respecting the source pre-query, target respecting the target pre-query, and matching:')}</div>
          }
          <FilterIconButton
            filters={filters}
            helpers={helpers}
            entityTypes={searchContext.entityTypes}
          />
        </>
      ) }
    </Box>
  </>;
};

export default WidgetFilters;
