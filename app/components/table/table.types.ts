import Pagination from "@/contracts/pagination";
import { ReactElement, ReactNode } from "react";

/**
 * Obtém o valor de uma propriedade aninhada usando um caminho em string.
 * Exemplo: "user.name.first"
 *
 * @example
 * getValueByPath({ user: { name: { first: "João" } } }, "user.name.first");
 * // → "João"
 */
export declare function getValueByPath(obj: any, path?: string): any;

/**
 * Retorna as keys de um objeto, incluindo propriedades aninhadas até certo nível.
 *
 * @template T - Objeto base.
 * @template Depth - Nível máximo de profundidade permitido (default: 2).
 *
 * @example
 * type A = { user: { name: string; address: { city: string } } };
 * type Keys = NestedKeyOf<A>; // "user" | "user.name" | "user.address" | "user.address.city"
 */
export type NestedKeyOf<T extends object, Depth extends number = 2> = [
  Depth
] extends [never]
  ? never
  : {
      [K in keyof T & string]: T[K] extends object
        ? K | `${K}.${NestedKeyOf<T[K], Decrement[Depth]>}`
        : K;
    }[keyof T & string];

/**
 * Auxiliar interno que reduz o nível de profundidade em cada chamada recursiva.
 */
type Decrement = [never, 0, 1, 2, 3, 4, 5];
/**
 * Representa uma definição de coluna da tabela.
 *
 * Você pode usar uma key direta do objeto (ex: `"name"`) ou uma função
 * de renderização para controlar o conteúdo da célula.
 *
 * @template T - Tipo do item de dados exibido na tabela.
 *
 * @example
 * // Exemplo simples com keys diretas
 * const columns = [
 *   { label: "Nome", key: "name" },
 *   { label: "Email", key: "email" },
 * ];
 *
 * @example
 * // Exemplo com renderização personalizada
 * const columns = [
 *   {
 *     label: "Status",
 *     callback: (user) => (
 *       <Badge color={user.active ? "green" : "red"}>
 *         {user.active ? "Ativo" : "Inativo"}
 *       </Badge>
 *     ),
 *   },
 * ];
 */
export type ColumnDef<T extends object> =
  | {
      /** Texto exibido no cabeçalho da coluna. */
      label: string;
      /** Caminho até a key do objeto (suporta acesso aninhado: "endereco.cidade"). */
      key: NestedKeyOf<T>;
    }
  | {
      /** Texto exibido no cabeçalho da coluna. */
      label: string;
      /** Caminho até a key do objeto (opcional quando `callback` é usado). */
      key?: NestedKeyOf<T>;
      /** Função de renderização customizada para esta coluna. */
      callback: (item: T) => ReactNode;
    }
  | {
      /** Texto exibido no cabeçalho da coluna. */
      label: string;
      /** Caminho até a key do objeto (opcional quando `callback` é usado). */
      key?: NestedKeyOf<T>;
      /** Função de renderização customizada para esta coluna. */
      renderer: Element;
    };

/**
 * Define um filtro exibido acima da tabela.
 *
 * O componente cria automaticamente os inputs de filtro
 * com base nesta estrutura.
 *
 * @template U - Tipo do objeto de filtros (ex: `{ nome: string; status: string }`)
 *
 * @example
 * const filters = [
 *   { type: "text", name: "nome", label: "Nome", placeholder: "Buscar por nome" },
 *   {
 *     type: "select",
 *     name: "status",
 *     label: "Status",
 *     options: [
 *       { value: "active", label: "Ativo" },
 *       { value: "inactive", label: "Inativo" },
 *     ],
 *   },
 * ];
 */
export type TableFilter<U> =
  | {
      /** Campo de texto livre. */
      type: "text";
      placeholder?: string;
      name: keyof U;
      label: string;
    }
  | {
      /** Campo de seleção (dropdown). */
      type: "select";
      placeholder?: string;
      name: keyof U;
      label: string;
      /** Opções disponíveis para o select. */
      options: { value: string; label: string }[];
    };

/**
 * Propriedades comuns compartilhadas por todas as variantes da tabela.
 *
 * @template T - Tipo dos dados exibidos.
 * @template U - Tipo dos filtros aplicáveis.
 */
export type CommonTableProps<
  T extends object,
  U extends Record<string, any>
> = {
  /** Lista de colunas a serem exibidas. */
  columnsDataMap: ColumnDef<T>[];

  /** Lista de filtros a exibir acima da tabela. */
  filters?: TableFilter<U>[];

  /** Adiciona campo de busca geral (por texto livre). */
  hasSearchTerm?: boolean;

  /** Componente renderizado acima da tabela (ex: título ou breadcrumbs). */
  headerComponent?: ReactNode;

  /** Componente renderizado entre filtros e tabela (ex: resumo de totais). */
  aditionalInfoComponent?: ReactNode;

  /** Ações principais (ex: botões de adicionar, exportar, etc). */
  actionsComponent?: ReactNode;

  /** Componente renderizado após a tabela (ex: rodapé com totais). */
  footerComponent?: ReactNode;

  /** Componente(s) filho(s) opcionais. */
  children?: ReactNode;

  /** Exibe estado de carregamento (mostra spinner e bloqueia interação). */
  isLoading?: boolean;

  /** Ações exibidas por linha (ex: editar, excluir, visualizar). */
  rowActions?: (item: T) => ReactNode;

  /** Informações adicionais exibidas por linha (ex: ícone de status). */
  rowInfo?: (item: T) => ReactNode;

  /** Evento disparado ao alterar qualquer campo do formulário de filtro. */
  onFormChange?: (event: any) => void;

  /** Evento disparado ao enviar o formulário de filtros. */
  onFormSubmit?: (event: any) => void;

  /** Função executada ao clicar em “Limpar filtros”. */
  clearFilters?: () => void;
};

/**
 * Propriedades comuns compartilhadas por todas as variantes da tabela.
 *
 * @template T - Tipo dos dados exibidos.
 * @template U - Tipo dos filtros aplicáveis.
 */
export type CheckPaginationType<
  T extends object,
  U extends Record<string, any>
> =
  | ({
      isPaginated?: true | undefined;
      /** Objeto de paginação contendo `data`, `total`, `page`, etc. */
      data: Pagination<T>;
    } & CommonTableProps<T, U>)
  | ({
      isPaginated?: false;
      data: T[];
    } & CommonTableProps<T, U>);

/**
 * Propriedades do componente de tabela paginada.
 *
 * @remarks
 * - Se `selectable` for `true`, o componente renderiza checkboxes e exige funções
 *   para controle de seleção.
 * - Caso contrário, a tabela funciona apenas como leitura.
 *
 * @template T - Tipo dos dados exibidos.
 * @template U - Tipo dos filtros aplicáveis.
 */
export type TableProps<
  T extends object,
  U extends Record<string, any> = Record<string, any>
> =
  | ({
      /** Ativa a seleção de múltiplas linhas. */
      selectable: true;

      /** Mapa de itens selecionados (index → item). */
      selectedItems: Map<number, T>;

      /** Função chamada ao marcar/desmarcar um item individual. */
      handleSelectItem: (item: T, index: number) => void;

      /** Função chamada ao marcar/desmarcar todos os itens. */
      handleSelectAll: (selected: boolean) => void;
    } & CheckPaginationType<T, U>)
  | ({
      /** Se omitido ou falso, desativa seleção de linhas. */
      selectable?: false;
      selectedItems?: never;
      handleSelectItem?: never;
      handleSelectAll?: never;
    } & CheckPaginationType<T, U>);

/**
 * Props do componente de paginação usado dentro da tabela.
 *
 * @example
 * ```tsx
 * <Pagination
 *   total={200}
 *   totalPages={10}
 *   page={1}
 *   limit={20}
 *   formRef={formRef}
 * />
 * ```
 */

export interface PaginationProps {
  hasNext: boolean;
  hasPrevious: boolean;
  limit: number;
  nextPage: number;
  page: number;
  previousPage: number;
  total: number;
  totalPages: number;
  /** Referência ao formulário principal para submissão automática. */
  formRef: React.RefObject<HTMLFormElement | null>;
  handleNext?: () => void;
  handlePrev?: () => void;
  handleChangePerPage?: () => void;
}

/**
 * Exemplo completo de uso do `Table`.
 *
 * @example
 * ```tsx
 * const pagination = {
 *   data: clientes,
 *   total: 100,
 *   totalPages: 10,
 *   page: 1,
 *   limit: 10,
 *   hasNext: true,
 *   hasPrevious: false,
 * };
 *
 * const columns = [
 *   { label: "Nome", key: "nome" },
 *   { label: "Email", key: "email" },
 *   {
 *     label: "Status",
 *     callback: (cliente) => (
 *       <span className={cliente.ativo ? "text-green-600" : "text-red-500"}>
 *         {cliente.ativo ? "Ativo" : "Inativo"}
 *       </span>
 *     ),
 *   },
 * ];
 *
 * const filters = [
 *   { type: "text", name: "nome", label: "Nome" },
 *   {
 *     type: "select",
 *     name: "status",
 *     label: "Status",
 *     options: [
 *       { value: "active", label: "Ativo" },
 *       { value: "inactive", label: "Inativo" },
 *     ],
 *   },
 * ];
 *
 * <Table
 *   data={pagination}
 *   columnsDataMap={columns}
 *   filters={filters}
 *   hasSearchTerm
 *   selectable
 *   selectedItems={selected}
 *   handleSelectItem={handleSelectItem}
 *   handleSelectAll={handleSelectAll}
 *   rowActions={(c) => <Button onClick={() => editarCliente(c)}>Editar</Button>}
 * />;
 * ```
 */
export type TableExample = void;
