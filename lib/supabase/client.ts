// Mock Supabase client for when integration is not connected
// This prevents import errors while maintaining the codebase structure

export const supabase = {
  from: (table: string) => ({
    select: (columns = "*") => ({
      order: (column: string, options?: any) => ({
        data: [],
        error: null,
      }),
    }),
    insert: (records: any[]) => ({
      data: null,
      error: { message: "Supabase integration not connected. Please connect Supabase to save data." },
    }),
    update: (record: any) => ({
      eq: (column: string, value: any) => ({
        data: null,
        error: { message: "Supabase integration not connected. Please connect Supabase to update data." },
      }),
    }),
    delete: () => ({
      eq: (column: string, value: any) => ({
        data: null,
        error: { message: "Supabase integration not connected. Please connect Supabase to delete data." },
      }),
    }),
  }),
}
