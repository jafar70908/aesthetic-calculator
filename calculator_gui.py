"""
Modern Aesthetic Desktop Calculator App using Tkinter.
Supports multiple themes, keyboard bindings, and mathematical utilities.
"""

import tkinter as tk
import math


THEMES = {
    "Midnight Cyber": {
        "bg": "#0b0f19",
        "surface": "#111827",
        "display_txt": "#f8fafc",
        "subtxt": "#94a3b8",
        "num_btn": "#1e293b",
        "num_hover": "#334155",
        "num_fg": "#f1f5f9",
        "op_btn": "#4f46e5",
        "op_hover": "#4338ca",
        "op_fg": "#ffffff",
        "eq_btn": "#06b6d4",
        "eq_hover": "#0891b2",
        "eq_fg": "#ffffff",
        "spec_btn": "#1e293b",
        "spec_hover": "#334155",
        "spec_fg": "#cbd5e1",
    },
    "Sakura Blossom": {
        "bg": "#fff1f2",
        "surface": "#ffe4e6",
        "display_txt": "#4c0519",
        "subtxt": "#9f1239",
        "num_btn": "#ffffff",
        "num_hover": "#fecdd3",
        "num_fg": "#881337",
        "op_btn": "#fb7185",
        "op_hover": "#f43f5e",
        "op_fg": "#ffffff",
        "eq_btn": "#f43f5e",
        "eq_hover": "#e11d48",
        "eq_fg": "#ffffff",
        "spec_btn": "#fecdd3",
        "spec_hover": "#fda4af",
        "spec_fg": "#9f1239",
    },
    "Matcha Zen": {
        "bg": "#06170e",
        "surface": "#0b1d13",
        "display_txt": "#ecfdf5",
        "subtxt": "#6ee7b7",
        "num_btn": "#112b1d",
        "num_hover": "#1a3e2a",
        "num_fg": "#d1fae5",
        "op_btn": "#059669",
        "op_hover": "#047857",
        "op_fg": "#ffffff",
        "eq_btn": "#10b981",
        "eq_hover": "#059669",
        "eq_fg": "#ffffff",
        "spec_btn": "#1a3e2a",
        "spec_hover": "#24553a",
        "spec_fg": "#a7f3d0",
    },
    "Warm Mocha": {
        "bg": "#140d08",
        "surface": "#1c140e",
        "display_txt": "#fef3c7",
        "subtxt": "#d97706",
        "num_btn": "#2b1e16",
        "num_hover": "#3e2c20",
        "num_fg": "#fde68a",
        "op_btn": "#b45309",
        "op_hover": "#92400e",
        "op_fg": "#ffffff",
        "eq_btn": "#d97706",
        "eq_hover": "#b45309",
        "eq_fg": "#ffffff",
        "spec_btn": "#3e2c20",
        "spec_hover": "#553c2c",
        "spec_fg": "#fcd34d",
    },
    "Frost Minimal": {
        "bg": "#f1f5f9",
        "surface": "#ffffff",
        "display_txt": "#0f172a",
        "subtxt": "#64748b",
        "num_btn": "#f8fafc",
        "num_hover": "#e2e8f0",
        "num_fg": "#1e293b",
        "op_btn": "#2563eb",
        "op_hover": "#1d4ed8",
        "op_fg": "#ffffff",
        "eq_btn": "#0284c7",
        "eq_hover": "#0369a1",
        "eq_fg": "#ffffff",
        "spec_btn": "#e2e8f0",
        "spec_hover": "#cbd5e1",
        "spec_fg": "#334155",
    }
}


class CalculatorApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Aesthetic Calculator")
        self.root.geometry("370x560")
        self.root.resizable(False, False)

        # Calculator State
        self.current_value = "0"
        self.previous_value = ""
        self.current_operation = None
        self.reset_screen = False
        self.current_theme = "Midnight Cyber"
        self.buttons_dict = {}

        self.setup_menu()
        self.setup_ui()
        self.apply_theme(self.current_theme)
        self.bind_keyboard()

    def setup_menu(self):
        menubar = tk.Menu(self.root)
        theme_menu = tk.Menu(menubar, tearoff=0)
        for theme_name in THEMES.keys():
            theme_menu.add_command(
                label=theme_name,
                command=lambda name=theme_name: self.apply_theme(name)
            )
        menubar.add_cascade(label="🎨 Themes", menu=theme_menu)
        self.root.config(menu=menubar)

    def setup_ui(self):
        self.main_container = tk.Frame(self.root, padx=16, pady=16)
        self.main_container.pack(fill="both", expand=True)

        # Display Frame
        self.display_frame = tk.Frame(self.main_container, padx=16, pady=14)
        self.display_frame.pack(fill="x", pady=(0, 14))

        # Expression history label
        self.expr_label = tk.Label(
            self.display_frame,
            text="",
            font=("Segoe UI", 11),
            anchor="e"
        )
        self.expr_label.pack(fill="x")

        # Current value label
        self.result_label = tk.Label(
            self.display_frame,
            text="0",
            font=("Segoe UI", 26, "bold"),
            anchor="e"
        )
        self.result_label.pack(fill="x")

        # Keypad Grid Frame
        self.keypad_frame = tk.Frame(self.main_container)
        self.keypad_frame.pack(fill="both", expand=True)

        for i in range(6):
            self.keypad_frame.rowconfigure(i, weight=1)
        for j in range(4):
            self.keypad_frame.columnconfigure(j, weight=1)

        buttons = [
            ("AC", 0, 0, "spec", self.all_clear),
            ("⌫", 0, 1, "spec", self.backspace),
            ("%", 0, 2, "spec", self.percent),
            ("÷", 0, 3, "op", lambda: self.set_operator("/")),
            ("√", 1, 0, "spec", self.sqrt),
            ("x²", 1, 1, "spec", self.square),
            ("±", 1, 2, "spec", self.negate),
            ("×", 1, 3, "op", lambda: self.set_operator("*")),
            ("7", 2, 0, "num", lambda: self.append_number("7")),
            ("8", 2, 1, "num", lambda: self.append_number("8")),
            ("9", 2, 2, "num", lambda: self.append_number("9")),
            ("−", 2, 3, "op", lambda: self.set_operator("-")),
            ("4", 3, 0, "num", lambda: self.append_number("4")),
            ("5", 3, 1, "num", lambda: self.append_number("5")),
            ("6", 3, 2, "num", lambda: self.append_number("6")),
            ("+", 3, 3, "op", lambda: self.set_operator("+")),
            ("1", 4, 0, "num", lambda: self.append_number("1")),
            ("2", 4, 1, "num", lambda: self.append_number("2")),
            ("3", 4, 2, "num", lambda: self.append_number("3")),
            ("=", 4, 3, "eq", self.calculate, 1, 2),
            ("0", 5, 0, "num", lambda: self.append_number("0"), 2, 1),
            (".", 5, 2, "num", self.append_decimal),
        ]

        for item in buttons:
            text = item[0]
            row = item[1]
            col = item[2]
            btn_type = item[3]
            cmd = item[4]
            colspan = item[5] if len(item) > 5 else 1
            rowspan = item[6] if len(item) > 6 else 1

            btn = tk.Button(
                self.keypad_frame,
                text=text,
                relief="flat",
                bd=0,
                cursor="hand2",
                command=cmd
            )
            btn.grid(
                row=row,
                column=col,
                columnspan=colspan,
                rowspan=rowspan,
                padx=4,
                pady=4,
                sticky="nsew"
            )
            self.buttons_dict[btn] = btn_type

    def apply_theme(self, theme_name):
        self.current_theme = theme_name
        colors = THEMES[theme_name]

        self.root.configure(bg=colors["bg"])
        self.main_container.configure(bg=colors["bg"])
        self.display_frame.configure(bg=colors["surface"])
        self.expr_label.configure(bg=colors["surface"], fg=colors["subtxt"])
        self.result_label.configure(bg=colors["surface"], fg=colors["display_txt"])
        self.keypad_frame.configure(bg=colors["bg"])

        for btn, btype in self.buttons_dict.items():
            if btype == "num":
                btn.configure(
                    bg=colors["num_btn"],
                    fg=colors["num_fg"],
                    activebackground=colors["num_hover"],
                    activeforeground=colors["num_fg"],
                    font=("Segoe UI", 14)
                )
            elif btype == "op":
                btn.configure(
                    bg=colors["op_btn"],
                    fg=colors["op_fg"],
                    activebackground=colors["op_hover"],
                    activeforeground=colors["op_fg"],
                    font=("Segoe UI", 16, "bold")
                )
            elif btype == "eq":
                btn.configure(
                    bg=colors["eq_btn"],
                    fg=colors["eq_fg"],
                    activebackground=colors["eq_hover"],
                    activeforeground=colors["eq_fg"],
                    font=("Segoe UI", 16, "bold")
                )
            else:
                btn.configure(
                    bg=colors["spec_btn"],
                    fg=colors["spec_fg"],
                    activebackground=colors["spec_hover"],
                    activeforeground=colors["spec_fg"],
                    font=("Segoe UI", 12)
                )

    def format_display(self, val_str):
        if val_str in ("Cannot divide by 0", "Error"):
            return val_str
        parts = val_str.split(".")
        int_part = parts[0]
        try:
            formatted_int = f"{int(int_part):,}"
        except ValueError:
            formatted_int = int_part
        if len(parts) > 1:
            return f"{formatted_int}.{parts[1]}"
        return formatted_int

    def update_ui(self):
        self.result_label.config(text=self.format_display(self.current_value))
        if self.previous_value and self.current_operation:
            op_sym = {"+": "+", "-": "−", "*": "×", "/": "÷"}.get(self.current_operation, "")
            self.expr_label.config(text=f"{self.format_display(self.previous_value)} {op_sym}")
        else:
            self.expr_label.config(text="")

    def append_number(self, num):
        if self.reset_screen or self.current_value in ("Cannot divide by 0", "Error"):
            self.current_value = ""
            self.reset_screen = False
        if self.current_value == "0":
            self.current_value = num
        else:
            if len(self.current_value) < 16:
                self.current_value += num
        self.update_ui()

    def append_decimal(self):
        if self.reset_screen or self.current_value in ("Cannot divide by 0", "Error"):
            self.current_value = "0"
            self.reset_screen = False
        if "." not in self.current_value:
            self.current_value += "."
        self.update_ui()

    def set_operator(self, op):
        if self.current_value in ("Cannot divide by 0", "Error"):
            self.all_clear()
            return
        if self.current_operation and not self.reset_screen:
            self.calculate()
        self.previous_value = self.current_value
        self.current_operation = op
        self.reset_screen = True
        self.update_ui()

    def clean_num(self, n):
        if math.isnan(n) or math.isinf(n):
            return "Error"
        res = round(n, 10)
        if res == int(res):
            return str(int(res))
        return str(res)

    def calculate(self):
        if not self.current_operation or not self.previous_value or self.reset_screen:
            return
        try:
            prev = float(self.previous_value)
            curr = float(self.current_value)
            if self.current_operation == "+":
                res = prev + curr
            elif self.current_operation == "-":
                res = prev - curr
            elif self.current_operation == "*":
                res = prev * curr
            elif self.current_operation == "/":
                if curr == 0:
                    self.current_value = "Cannot divide by 0"
                    self.previous_value = ""
                    self.current_operation = None
                    self.update_ui()
                    return
                res = prev / curr
            else:
                return

            self.current_value = self.clean_num(res)
            self.previous_value = ""
            self.current_operation = None
            self.reset_screen = True
            self.update_ui()
        except Exception:
            self.current_value = "Error"
            self.update_ui()

    def all_clear(self):
        self.current_value = "0"
        self.previous_value = ""
        self.current_operation = None
        self.reset_screen = False
        self.update_ui()

    def backspace(self):
        if self.reset_screen or self.current_value in ("Cannot divide by 0", "Error"):
            self.all_clear()
            return
        if len(self.current_value) <= 1 or (len(self.current_value) == 2 and self.current_value.startswith("-")):
            self.current_value = "0"
        else:
            self.current_value = self.current_value[:-1]
        self.update_ui()

    def percent(self):
        try:
            val = float(self.current_value)
            self.current_value = self.clean_num(val / 100)
            self.update_ui()
        except Exception:
            pass

    def sqrt(self):
        try:
            val = float(self.current_value)
            if val < 0:
                self.current_value = "Error"
            else:
                self.current_value = self.clean_num(math.sqrt(val))
                self.reset_screen = True
            self.update_ui()
        except Exception:
            pass

    def square(self):
        try:
            val = float(self.current_value)
            self.current_value = self.clean_num(val * val)
            self.reset_screen = True
            self.update_ui()
        except Exception:
            pass

    def negate(self):
        if self.current_value in ("0", "Cannot divide by 0", "Error"):
            return
        if self.current_value.startswith("-"):
            self.current_value = self.current_value[1:]
        else:
            self.current_value = "-" + self.current_value
        self.update_ui()

    def bind_keyboard(self):
        for digit in "0123456789":
            self.root.bind(digit, lambda e, d=digit: self.append_number(d))
        self.root.bind(".", lambda e: self.append_decimal())
        self.root.bind("+", lambda e: self.set_operator("+"))
        self.root.bind("-", lambda e: self.set_operator("-"))
        self.root.bind("*", lambda e: self.set_operator("*"))
        self.root.bind("/", lambda e: self.set_operator("/"))
        self.root.bind("<Return>", lambda e: self.calculate())
        self.root.bind("=", lambda e: self.calculate())
        self.root.bind("<BackSpace>", lambda e: self.backspace())
        self.root.bind("<Escape>", lambda e: self.all_clear())
        self.root.bind("%", lambda e: self.percent())


if __name__ == "__main__":
    root = tk.Tk()
    app = CalculatorApp(root)
    root.mainloop()
