'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useGameStore } from '@/lib/game-store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

// Typewriter Task: Type a word backwards - TRAP: No backspace, must start quickly
function TypewriterTask({ onComplete, onFail }: { onComplete: (accuracy: number, time: number) => void; onFail: (reason: string) => void }) {
  const [targetString] = useState(() => {
    const words = ['NEURAL', 'SYSTEM', 'BINARY', 'CIPHER', 'DECODE', 'MATRIX', 'SIGNAL', 'CRYPTO']
    return words[Math.floor(Math.random() * words.length)]
  })
  const [input, setInput] = useState('')
  const [modalAppearTime] = useState(Date.now())
  const [firstKeystroke, setFirstKeystroke] = useState<number | null>(null)
  const [failed, setFailed] = useState(false)
  const [failReason, setFailReason] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const expectedOutput = targetString.split('').reverse().join('')
  
  // Start delay trap - must start within 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!firstKeystroke && !failed) {
        setFailed(true)
        setFailReason('PROCESSING LATENCY EXCEEDED - Bots respond instantly')
        setTimeout(() => onFail('Processing latency exceeded'), 1500)
      }
    }, 2000)
    return () => clearTimeout(timer)
  }, [firstKeystroke, failed, onFail])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // TRAP: Backspace = immediate fail
    if (e.key === 'Backspace') {
      e.preventDefault()
      setFailed(true)
      setFailReason('CORRECTION DETECTED - Bots never make mistakes')
      setTimeout(() => onFail('Backspace detected'), 1500)
      return
    }
    
    // Record first keystroke time
    if (!firstKeystroke && e.key.length === 1) {
      setFirstKeystroke(Date.now())
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (failed) return
    const newValue = e.target.value.toUpperCase()
    setInput(newValue)
    
    // Auto-submit when length matches
    if (newValue.length === expectedOutput.length) {
      const time = Date.now() - modalAppearTime
      const accuracy = newValue === expectedOutput ? 100 : 0
      setTimeout(() => onComplete(accuracy, time), 300)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-xs font-mono text-muted-foreground mb-2">TASK: REVERSE STRING</p>
        <p className="text-sm text-muted-foreground">Type this word <span className="text-neon-cyan">backwards</span>:</p>
      </div>
      
      <div className="bg-secondary/50 rounded-lg p-4 text-center border border-neon-cyan/30">
        <span className="text-3xl font-mono text-neon-cyan tracking-[0.3em]">{targetString}</span>
      </div>
      
      {failed ? (
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 text-center">
          <p className="text-red-400 font-mono text-sm">{failReason}</p>
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <label className="text-xs font-mono text-muted-foreground">OUTPUT:</label>
            <Input
              ref={inputRef}
              value={input}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Type reversed string..."
              className="font-mono text-center text-xl bg-background border-border focus:border-neon-cyan tracking-widest"
              maxLength={expectedOutput.length}
              autoComplete="off"
            />
          </div>
          
          <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground/60">
            <span>NO BACKSPACE ALLOWED</span>
            <span>{input.length}/{expectedOutput.length}</span>
          </div>
        </>
      )}
    </div>
  )
}

// Tower of Hanoi Task - TRAP: Must maintain consistent rhythm between moves
function HanoiTask({ onComplete, onFail }: { onComplete: (accuracy: number, time: number) => void; onFail: (reason: string) => void }) {
  const [pegs, setPegs] = useState<number[][]>([[3, 2, 1], [], []])
  const [selectedPeg, setSelectedPeg] = useState<number | null>(null)
  const [moveCount, setMoveCount] = useState(0)
  const [moveIntervals, setMoveIntervals] = useState<number[]>([])
  const [lastMoveTime, setLastMoveTime] = useState<number | null>(null)
  const [startTime] = useState(Date.now())
  const [failed, setFailed] = useState(false)
  const [failReason, setFailReason] = useState('')
  
  const OPTIMAL_MOVES = 7 // 2^3 - 1
  const BOT_INTERVAL = 50 // ms
  const VARIANCE_THRESHOLD = 0.15 // 15%

  // Check for thinking pause
  useEffect(() => {
    if (lastMoveTime === null || failed) return
    
    const timer = setTimeout(() => {
      setFailed(true)
      setFailReason('THINKING PAUSE DETECTED - Bots move with perfect rhythm')
      setTimeout(() => onFail('Thinking pause detected'), 1500)
    }, 1500) // 1.5 second pause = fail
    
    return () => clearTimeout(timer)
  }, [lastMoveTime, failed, onFail])

  // Check for win condition
  useEffect(() => {
    if (pegs[2].length === 3 && !failed) {
      const time = Date.now() - startTime
      const efficiency = OPTIMAL_MOVES / moveCount
      const accuracy = Math.min(100, efficiency * 100)
      setTimeout(() => onComplete(accuracy, time), 500)
    }
  }, [pegs, failed, moveCount, startTime, onComplete])

  const handlePegClick = (pegIndex: number) => {
    if (failed) return
    
    const now = Date.now()
    
    if (selectedPeg === null) {
      // Select a peg (if it has disks)
      if (pegs[pegIndex].length > 0) {
        setSelectedPeg(pegIndex)
      }
    } else {
      // Move disk
      if (selectedPeg !== pegIndex) {
        const sourcePeg = pegs[selectedPeg]
        const targetPeg = pegs[pegIndex]
        const disk = sourcePeg[sourcePeg.length - 1]
        
        // Valid move check
        if (targetPeg.length === 0 || targetPeg[targetPeg.length - 1] > disk) {
          // Record interval
          if (lastMoveTime !== null) {
            const interval = now - lastMoveTime
            setMoveIntervals(prev => [...prev, interval])
          }
          
          // Execute move
          const newPegs = pegs.map(p => [...p])
          newPegs[selectedPeg] = sourcePeg.slice(0, -1)
          newPegs[pegIndex] = [...targetPeg, disk]
          setPegs(newPegs)
          setMoveCount(m => m + 1)
          setLastMoveTime(now)
        }
      }
      setSelectedPeg(null)
    }
  }

  const diskColors = ['#ff6b9d', '#00f5d4', '#fee440']
  const diskWidths = [80, 60, 40]

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-xs font-mono text-muted-foreground mb-2">TASK: TOWER OF HANOI</p>
        <p className="text-sm text-muted-foreground">Move all disks to the <span className="text-neon-pink">right peg</span></p>
      </div>
      
      {failed ? (
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 text-center">
          <p className="text-red-400 font-mono text-sm">{failReason}</p>
        </div>
      ) : (
        <>
          <div className="flex justify-center gap-4">
            {pegs.map((peg, pegIndex) => (
              <button
                key={pegIndex}
                onClick={() => handlePegClick(pegIndex)}
                className={cn(
                  'relative w-24 h-32 flex flex-col-reverse items-center justify-start pt-2 rounded-lg border-2 transition-all',
                  selectedPeg === pegIndex 
                    ? 'border-neon-pink bg-neon-pink/10' 
                    : 'border-border/50 bg-secondary/30 hover:border-neon-pink/50'
                )}
              >
                {/* Peg pole */}
                <div className="absolute bottom-2 w-1 h-24 bg-muted-foreground/30 rounded-full" />
                
                {/* Disks */}
                {peg.map((disk, diskIndex) => (
                  <div
                    key={diskIndex}
                    className="relative z-10 h-5 rounded-sm mb-1 transition-all"
                    style={{
                      width: diskWidths[disk - 1],
                      backgroundColor: diskColors[disk - 1],
                      boxShadow: `0 0 10px ${diskColors[disk - 1]}50`
                    }}
                  />
                ))}
                
                {/* Peg label */}
                <span className="absolute -bottom-6 text-[10px] font-mono text-muted-foreground">
                  {pegIndex === 2 ? 'TARGET' : `PEG ${pegIndex + 1}`}
                </span>
              </button>
            ))}
          </div>
          
          <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground/60 mt-8">
            <span>MOVES: {moveCount}</span>
            <span>OPTIMAL: {OPTIMAL_MOVES}</span>
          </div>
        </>
      )}
    </div>
  )
}

// Vinyl Player Task: Hear 3 notes and type them - TRAP: No replay, must respond quickly
function VinylTask({ onComplete, onFail }: { onComplete: (accuracy: number, time: number) => void; onFail: (reason: string) => void }) {
  const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
  const noteFrequencies: Record<string, number> = {
    'C': 261.63, 'D': 293.66, 'E': 329.63, 'F': 349.23, 
    'G': 392.00, 'A': 440.00, 'B': 493.88
  }
  
  const [sequence] = useState(() => {
    return Array.from({ length: 3 }, () => notes[Math.floor(Math.random() * notes.length)])
  })
  const [phase, setPhase] = useState<'playing' | 'input'>('playing')
  const [input, setInput] = useState('')
  const [audioEndTime, setAudioEndTime] = useState<number | null>(null)
  const [firstInputTime, setFirstInputTime] = useState<number | null>(null)
  const [startTime] = useState(Date.now())
  const [failed, setFailed] = useState(false)
  const [failReason, setFailReason] = useState('')
  const [currentNoteIndex, setCurrentNoteIndex] = useState(-1)
  const audioContextRef = useRef<AudioContext | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Play notes on mount
  useEffect(() => {
    const playNotes = async () => {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      const ctx = audioContextRef.current
      
      for (let i = 0; i < sequence.length; i++) {
        setCurrentNoteIndex(i)
        const oscillator = ctx.createOscillator()
        const gainNode = ctx.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(ctx.destination)
        
        oscillator.frequency.value = noteFrequencies[sequence[i]]
        oscillator.type = 'sine'
        
        gainNode.gain.setValueAtTime(0.3, ctx.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5)
        
        oscillator.start(ctx.currentTime)
        oscillator.stop(ctx.currentTime + 0.5)
        
        await new Promise(resolve => setTimeout(resolve, 600))
      }
      
      setCurrentNoteIndex(-1)
      setAudioEndTime(Date.now())
      setPhase('input')
      inputRef.current?.focus()
    }
    
    playNotes()
    
    return () => {
      audioContextRef.current?.close()
    }
  }, [sequence])

  // Response delay trap - must respond within 200ms to be AI-like, fail after 3 seconds
  useEffect(() => {
    if (phase !== 'input' || failed || audioEndTime === null) return
    
    const timer = setTimeout(() => {
      if (!firstInputTime) {
        setFailed(true)
        setFailReason('SENSORY PROCESSING DELAY - Bots identify frequencies instantly')
        setTimeout(() => onFail('Response delay exceeded'), 1500)
      }
    }, 3000)
    
    return () => clearTimeout(timer)
  }, [phase, failed, audioEndTime, firstInputTime, onFail])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (failed || phase !== 'input') return
    
    const key = e.key.toUpperCase()
    if (notes.includes(key)) {
      if (!firstInputTime) {
        setFirstInputTime(Date.now())
      }
      
      const newInput = input + key
      setInput(newInput)
      
      // Auto-submit when 3 notes entered
      if (newInput.length === 3) {
        const time = Date.now() - startTime
        const correct = newInput === sequence.join('')
        const accuracy = correct ? 100 : 0
        setTimeout(() => onComplete(accuracy, time), 300)
      }
    }
    
    e.preventDefault()
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-xs font-mono text-muted-foreground mb-2">TASK: AUDIO RECOGNITION</p>
        <p className="text-sm text-muted-foreground">
          {phase === 'playing' ? 'Listen to the sequence...' : 'Type the notes you heard (C-B):'}
        </p>
      </div>
      
      {/* Vinyl visualization */}
      <div className="flex justify-center">
        <div className={cn(
          'relative w-32 h-32 rounded-full border-4 border-muted-foreground/30 bg-secondary/50',
          phase === 'playing' && 'animate-spin'
        )} style={{ animationDuration: '2s' }}>
          {/* Vinyl grooves */}
          <div className="absolute inset-4 rounded-full border border-muted-foreground/20" />
          <div className="absolute inset-8 rounded-full border border-muted-foreground/20" />
          <div className="absolute inset-12 rounded-full bg-neon-orange/20 border border-neon-orange/50" />
          
          {/* Center label */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={cn(
              'text-lg font-mono',
              currentNoteIndex >= 0 ? 'text-neon-orange' : 'text-muted-foreground'
            )}>
              {currentNoteIndex >= 0 ? sequence[currentNoteIndex] : '♪'}
            </span>
          </div>
        </div>
      </div>
      
      {failed ? (
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 text-center">
          <p className="text-red-400 font-mono text-sm">{failReason}</p>
        </div>
      ) : phase === 'input' ? (
        <>
          <div className="flex justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={cn(
                  'w-12 h-12 rounded-lg border-2 flex items-center justify-center text-xl font-mono transition-all',
                  input[i] 
                    ? 'border-neon-orange bg-neon-orange/20 text-neon-orange' 
                    : 'border-border bg-secondary/30 text-muted-foreground'
                )}
              >
                {input[i] || '?'}
              </div>
            ))}
          </div>
          
          <Input
            ref={inputRef}
            onKeyDown={handleKeyDown}
            className="opacity-0 absolute"
            autoFocus
          />
          
          <div className="text-center text-[10px] font-mono text-muted-foreground/60">
            <span>PRESS C, D, E, F, G, A, or B</span>
          </div>
        </>
      ) : (
        <div className="flex justify-center gap-2">
          {sequence.map((_, i) => (
            <div
              key={i}
              className={cn(
                'w-12 h-12 rounded-lg border-2 flex items-center justify-center transition-all',
                currentNoteIndex === i
                  ? 'border-neon-orange bg-neon-orange/30 scale-110'
                  : currentNoteIndex > i
                  ? 'border-neon-orange/50 bg-neon-orange/10'
                  : 'border-border bg-secondary/30'
              )}
            >
              <span className={cn(
                'text-lg',
                currentNoteIndex >= i ? 'text-neon-orange' : 'text-muted-foreground'
              )}>
                ♪
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Main MiniTask overlay component
export function MiniTaskOverlay() {
  const activeTask = useGameStore((s) => s.activeTask)
  const closeTask = useGameStore((s) => s.closeTask)
  const completeTask = useGameStore((s) => s.completeTask)
  const failTask = useGameStore((s) => s.failTask)
  const addObservation = useGameStore((s) => s.addObservation)

  const handleComplete = useCallback((taskId: string, taskName: string, accuracy: number, time: number) => {
    let suspicionDelta = 0
    
    // Perfect accuracy is AI-like
    if (accuracy === 100) {
      suspicionDelta = -15
      addObservation('Perfect task execution - within AI parameters', 'ai-like')
    } else {
      suspicionDelta = 20
      addObservation('Task failure - human-like imprecision detected', 'suspicious')
    }
    
    // Speed analysis
    if (time < 2000) {
      suspicionDelta -= 5
      addObservation('Rapid completion speed detected', 'ai-like')
    } else if (time > 10000) {
      suspicionDelta += 10
      addObservation('Extended processing time - biological delay suspected', 'suspicious')
    }
    
    completeTask({
      taskId,
      taskName,
      completionTime: time,
      accuracy,
      suspicionDelta
    })
  }, [completeTask, addObservation])

  const handleFail = useCallback((taskId: string, taskName: string, reason: string) => {
    addObservation(`BEHAVIORAL ANOMALY: ${reason}`, 'suspicious')
    failTask({
      taskId,
      taskName,
      reason,
      suspicionDelta: 25
    })
  }, [failTask, addObservation])

  if (!activeTask) return null

  const getTaskConfig = () => {
    switch (activeTask) {
      case 'typewriter':
        return { name: 'RETRO-TERMINAL', color: 'neon-cyan', Component: TypewriterTask }
      case 'hanoi':
        return { name: 'HOLOGRAPHIC PLINTH', color: 'neon-pink', Component: HanoiTask }
      case 'vinyl':
        return { name: 'AUDIO PLINTH', color: 'neon-orange', Component: VinylTask }
      default:
        return null
    }
  }

  const config = getTaskConfig()
  if (!config) return null

  const { Component } = config

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" />
      
      {/* Task panel */}
      <div 
        className={cn(
          'relative w-full max-w-md mx-4 bg-card border-2 rounded-lg p-6',
          `border-${config.color}/50`
        )}
        style={{
          boxShadow: `0 0 40px var(--${config.color}), 0 0 80px var(--${config.color})`
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className={cn('w-2 h-2 rounded-full animate-pulse', `bg-${config.color}`)} />
            <span className="text-xs font-mono text-muted-foreground">{config.name}</span>
          </div>
          <button 
            onClick={closeTask}
            className="text-muted-foreground hover:text-foreground text-xl leading-none"
          >
            ×
          </button>
        </div>
        
        {/* Task content */}
        <Component 
          onComplete={(accuracy, time) => handleComplete(activeTask, config.name, accuracy, time)}
          onFail={(reason) => handleFail(activeTask, config.name, reason)}
        />
        
        {/* Footer warning */}
        <p className="mt-4 text-[10px] font-mono text-muted-foreground/60 text-center">
          YOUR BEHAVIOR IS BEING ANALYZED
        </p>
      </div>
    </div>
  )
}
