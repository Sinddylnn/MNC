"""Regressões da validação de dependências JavaScript do artefato."""

import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from tools import validar_site


class ImportacoesJavaScriptTest(unittest.TestCase):
    def test_dependencias_estaticas_e_dinamicas_em_subpastas(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            core = root / "js" / "core"
            core.mkdir(parents=True)
            (root / "js" / "feature.js").write_text("export const value = 1;", encoding="utf-8")
            (core / "bootstrap.js").write_text(
                'import { value } from "../feature.js";\n'
                "import '../feature.js';\n"
                "export { value } from '../feature.js';\n"
                "const load = () => import(\n  '../feature.js'\n);\n",
                encoding="utf-8",
            )
            errors = []
            with patch.object(validar_site, "RAIZ", root):
                count = validar_site.validar_importacoes_js(errors)
            self.assertEqual(count, 4)
            self.assertEqual(errors, [])

    def test_import_dinamico_ausente_indica_arquivo_e_linha(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            (root / "js").mkdir()
            (root / "js" / "main.js").write_text(
                "const page = 'gallery';\nconst load = () => import('./missing.js');\n",
                encoding="utf-8",
            )
            errors = []
            with patch.object(validar_site, "RAIZ", root):
                validar_site.validar_importacoes_js(errors)
            self.assertEqual(len(errors), 1)
            self.assertIn("js/main.js:2:", errors[0])
            self.assertIn("./missing.js", errors[0])


if __name__ == "__main__":
    unittest.main()
