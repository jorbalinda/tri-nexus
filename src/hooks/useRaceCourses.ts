'use client'

import { useEffect, useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RaceCourse } from '@/lib/types/race-plan'

export function useRaceCourses() {
  const [courses, setCourses] = useState<RaceCourse[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetch = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('race_courses')
      .select('*')
      .order('name', { ascending: true })

    setCourses((data as RaceCourse[]) || [])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetch()
  }, [fetch])

  const globalCourses = useMemo(
    () => courses.filter((c) => c.user_id === null),
    [courses]
  )

  const userCourses = useMemo(
    () => courses.filter((c) => c.user_id !== null),
    [courses]
  )

  const createUserCourse = useCallback(
    async (course: Omit<RaceCourse, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data, error } = await supabase
        .from('race_courses')
        .insert({ ...course, user_id: user?.id })
        .select()
        .single()

      if (error) throw error
      setCourses((prev) => [data as RaceCourse, ...prev])
      return data as RaceCourse
    },
    [supabase]
  )

  const deleteUserCourse = useCallback(
    async (id: string) => {
      const { error } = await supabase.from('race_courses').delete().eq('id', id)
      if (error) throw error
      setCourses((prev) => prev.filter((c) => c.id !== id))
    },
    [supabase]
  )

  return {
    courses,
    globalCourses,
    userCourses,
    loading,
    createUserCourse,
    deleteUserCourse,
    refetch: fetch,
  }
}
